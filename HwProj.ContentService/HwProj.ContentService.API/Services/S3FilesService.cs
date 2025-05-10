using Amazon.S3;
using Amazon.S3.Model;
using HwProj.ContentService.API.Configuration;
using HwProj.ContentService.API.Extensions;
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

    public S3FilesService(IAmazonS3 s3Client, IOptions<StorageClientConfiguration> storageClientConfiguration)
    {
        _s3AmazonClient = s3Client;
        _bucketName = storageClientConfiguration.Value.DefaultBucketName
                      ?? throw new NullReferenceException("Не указано имя бакета для сохранения файлов");
    }

    // Если файл с таким ключем уже существует, в текущей реализации он будет перезаписываться
    public async Task<Result> UploadFileAsync(IFormFile fileContent, string externalKey, string uploaderId)
    {
        try
        {
            await using var fileStream = fileContent.OpenReadStream();
            var request = CreateUploadRequest(fileContent.ContentType, fileStream, externalKey, uploaderId);

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

    private PutObjectRequest CreateUploadRequest(string contentType, Stream fileStream,
        string externalKey, string uploaderId)
    {
        // Для нормального отображения кириллицы в файлах
        if (contentType.StartsWith("text/"))
            contentType += "; charset=utf-8";

        return new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = externalKey,
            InputStream = fileStream,
            ContentType = contentType,
            DisableDefaultChecksumValidation = true,
            Metadata = { [UploaderIdMetadataKey] = uploaderId }
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