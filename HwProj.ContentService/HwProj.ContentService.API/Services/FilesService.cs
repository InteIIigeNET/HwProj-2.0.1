using System.Net;
using Amazon.S3;
using Amazon.S3.Model;
using HwProj.ContentService.API.Configuration;
using HwProj.ContentService.API.Extensions;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.Result;
using Microsoft.Extensions.Options;

namespace HwProj.ContentService.API.Services;

public class FilesService : IFilesService
{
    private const int FileDownloadUrlExpirationMinutes = 10;
    private const string UploaderIdMetadataKey = "uploader-id";
    private const string AwsMetaDataPrefix = "x-amz-meta-";
    private readonly string _bucketName;

    private readonly IAmazonS3 _s3AmazonClient;
    private readonly IFileKeyService _fileKeyService;

    public FilesService(IAmazonS3 s3Client, IOptions<StorageClientConfiguration> storageClientConfiguration,
        IFileKeyService fileKeyService)
    {
        _s3AmazonClient = s3Client;
        _fileKeyService = fileKeyService;
        _bucketName = storageClientConfiguration.Value.DefaultBucketName
                      ?? throw new NullReferenceException("Не указано имя бакета для сохранения файлов");
    }

    // Если файл с таким ключем уже существует, в текущей реализации он будет перезаписываться
    public async Task<Result> UploadFileAsync(UploadFileDTO uploadFileDto, string uploaderId)
    {
        try
        {
            var fileKey = _fileKeyService.BuildFileKey(uploadFileDto);
            await using var stream = uploadFileDto.File.OpenReadStream();
            var request = CreateUploadRequest(uploadFileDto, uploaderId, stream, fileKey);

            var response = await _s3AmazonClient.PutObjectAsync(request);
            return response.IsSuccessStatusCode()
                ? Result.Success()
                : Result.Failed("Не удалось загрузить файл");
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.PreconditionFailed)
        {
            return Result.Failed("Файл с таким именем уже существует");
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

    public async Task<List<FileInfoDTO>> GetFilesInfoAsync(long courseId, long homeworkId = -1)
    {
        var searchPrefix = _fileKeyService.GetFilesSearchPrefix(courseId, homeworkId);
        var files = await GetFilesByPrefix(searchPrefix);

        return files.Select(f =>
        {
            if (homeworkId == -1 && !_fileKeyService.GetHomeworkIdFromKey(f.Key, out homeworkId))
                throw new ApplicationException($"Путь к файлу {f.Key} не содержит идентификатора домашней работы");
            return new FileInfoDTO
            {
                Name = f.Name,
                Key = f.Key,
                Size = f.Size,
                HomeworkId = homeworkId
            };
        }).ToList();
    }

    public async Task<Result> DeleteFileAsync(string fileKey, string userId)
    {
        try
        {
            var response = await _s3AmazonClient.DeleteObjectAsync(_bucketName, fileKey);
            return response.IsSuccessStatusCode()
                ? Result.Success()
                : Result.Failed("Не удалось удалить файл");
        }
        catch (Exception e)
        {
            return Result.Failed(e.Message);
        }
    }

    private PutObjectRequest CreateUploadRequest(UploadFileDTO dto, string uploaderId, Stream stream,
        string fileKey)
    {
        // Для нормального отображения кириллицы в файлах
        var contentType = dto.File.ContentType;
        if (contentType.StartsWith("text/"))
            contentType += "; charset=utf-8";

        return new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = fileKey,
            InputStream = stream,
            ContentType = contentType,
            DisableDefaultChecksumValidation = true,
            Metadata = { [UploaderIdMetadataKey] = uploaderId }
        };
    }

    private async Task<List<FileInfoDTO>> GetFilesByPrefix(string prefix)
    {
        var response = await _s3AmazonClient.ListObjectsV2Async(
            new ListObjectsV2Request
            {
                BucketName = _bucketName,
                Prefix = prefix
            });

        return response.S3Objects?.Select(obj =>
            new FileInfoDTO
            {
                Key = obj.Key,
                Size = obj.Size ??
                       throw new ArgumentException("В хранилище отсутствует информация о размере файла", nameof(obj)),
                Name = _fileKeyService.GetFileName(obj.Key),
            }).ToList() ?? new List<FileInfoDTO>();
    }

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