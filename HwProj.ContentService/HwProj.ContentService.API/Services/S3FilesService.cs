using System.Text.RegularExpressions;
using Amazon.S3;
using Amazon.S3.Model;
using HwProj.ContentService.API.Configuration;
using HwProj.ContentService.API.Extensions;
using HwProj.ContentService.API.Models.DTO;
using HwProj.ContentService.API.Models.Enums;
using HwProj.ContentService.API.Services.Interfaces;
using HwProj.Models.Result;
using Microsoft.Extensions.Options;

namespace HwProj.ContentService.API.Services;

public class S3FilesService : IS3FilesService
{
    private const int FileDownloadUrlExpirationMinutes = 10;
    private const string UploaderIdMetadataKey = "uploader-id";
    private const string AwsMetaDataPrefix = "x-amz-meta-";
    private readonly string _bucketName;

    private readonly IAmazonS3 _s3AmazonClient;

    public S3FilesService(IAmazonS3 s3Client, IOptions<ExternalStorageConfiguration> externalStorageConfiguration)
    {
        _s3AmazonClient = s3Client;
        _bucketName = externalStorageConfiguration.Value.DefaultBucketName
                      ?? throw new NullReferenceException("Не указано имя бакета для сохранения файлов");
    }
    
    // Метод позволяет получить файлы вместе с дополнительной информацией из бакета.
    // filePathPattern должен содержать группы FileName, HomeworkId и CourseId,
    // чтобы эту дополнительную информацию из пути к файлу извлечь
    public async Task<List<FileTransferDTO>> GetBucketFilesAsync(string bucketName, string filePathPattern)
    {
        var bucketKeys = await _s3AmazonClient.GetAllObjectKeysAsync(bucketName, string.Empty, null);
        var filesBucketKeys = bucketKeys.Where(key => key[^1] != '/');

        var regex = new Regex(filePathPattern, RegexOptions.Compiled);

        var tasks = filesBucketKeys.Select(async (key) =>
        {
            // Получаем метаданные объекта, чтобы извлечь ContentType
            var metadataResponse = await _s3AmazonClient.GetObjectMetadataAsync(new GetObjectMetadataRequest
            {
                BucketName = bucketName,
                Key = key
            });
            
            // Получаем сам файл
            var fileStream = await GetFileStream(bucketName, key);

            var match = regex.Match(key);

            return new FileTransferDTO(
                Name: match.Groups["FileName"].Value,
                SizeInBytes: metadataResponse.Headers.ContentLength,
                ContentType: metadataResponse.Headers.ContentType,
                FileStream: fileStream,
                CourseUnitType: CourseUnitType.Homework,
                CourseUnitId: long.Parse(match.Groups["HomeworkId"].Value),
                CourseId: long.Parse(match.Groups["CourseId"].Value)
            );
        }).ToList();
        
        var fileTransfers = await Task.WhenAll(tasks);
        return fileTransfers.ToList();
    }
    
    // Если файл с таким ключем уже существует, в текущей реализации он будет перезаписываться
    public async Task<Result> UploadFileAsync(UploadFileToS3Dto uploadFileToS3Dto)
    {
        try
        {
            var request = CreateUploadRequest(uploadFileToS3Dto);
            var response = await _s3AmazonClient.PutObjectAsync(request);
            return response.IsSuccessStatusCode()
                ? Result.Success()
                : Result.Failed($"Не удалось загрузить файл. Код ответа хранилища: {(int)response.HttpStatusCode}");
        }
        catch (Exception e)
        {
            return Result.Failed(e.Message);
        }
    }

    public async Task<Result<string>> GetDownloadUrl(string fileKey)
    {
        try
        {
            var url = await _s3AmazonClient.GetPreSignedURLAsync(
                new GetPreSignedUrlRequest
                {
                    BucketName = _bucketName,
                    Key = fileKey,
                    Expires = DateTime.UtcNow.AddMinutes(FileDownloadUrlExpirationMinutes)
                });

            return url != null
                ? Result<string>.Success(url)
                : Result<string>.Failed("Файл не найден");
        }
        catch (Exception e)
        {
            return Result<string>.Failed(e.Message);
        }
    }

    public async Task<bool> CheckFileExistence(string fileKey)
    {
        try
        {
            var response = await _s3AmazonClient.GetObjectMetadataAsync(_bucketName, fileKey);
            return response.IsSuccessStatusCode();
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<Result> DeleteFileAsync(string fileKey)
    {
        try
        {
            var response = await _s3AmazonClient.DeleteObjectAsync(_bucketName, fileKey);
            return response.IsSuccessStatusCode()
                ? Result.Success()
                : Result.Failed($"Не удалось удалить файл. Код ответа хранилища: {(int)response.HttpStatusCode}");
        }
        catch (Exception e)
        {
            return Result.Failed(e.Message);
        }
    }
    
    private async Task<Stream> GetFileStream(string bucketName, string fileKey)
        => await _s3AmazonClient.GetObjectStreamAsync(bucketName, fileKey, null);

    private PutObjectRequest CreateUploadRequest(UploadFileToS3Dto uploadFileToS3Dto)
    {
        var contentType = uploadFileToS3Dto.ContentType;
        // Для нормального отображения кириллицы в файлах
        if (contentType.StartsWith("text/"))
            contentType += "; charset=utf-8";

        return new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = uploadFileToS3Dto.ExternalKey,
            InputStream = uploadFileToS3Dto.FileStream,
            ContentType = contentType,
            DisableDefaultChecksumValidation = true,
            Metadata = { [UploaderIdMetadataKey] = uploadFileToS3Dto.UploaderId }
        };
    }

    private async Task<ListObjectsV2Response> FetchFilesInfoByPrefix(string prefix)
        => await _s3AmazonClient.ListObjectsV2Async(
            new ListObjectsV2Request
            {
                BucketName = _bucketName,
                Prefix = prefix
            });

    private static bool IsOwner(MetadataCollection metadata, string userId)
        => metadata[$"{AwsMetaDataPrefix}{UploaderIdMetadataKey}"] == userId;

    private async Task<MetadataCollection> GetFileMetadataAsync(string fileKey)
    {
        var metadataResponse = await _s3AmazonClient.GetObjectMetadataAsync(new GetObjectMetadataRequest
        {
            BucketName = _bucketName,
            Key = fileKey
        });

        return metadataResponse.Metadata;
    }
}