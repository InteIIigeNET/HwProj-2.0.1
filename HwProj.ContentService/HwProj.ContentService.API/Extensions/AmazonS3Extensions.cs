using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Util;

namespace HwProj.ContentService.API.Extensions;

public static class AmazonS3Extensions
{
    public static async Task CreateBucketIfNotExists(this IAmazonS3 amazonS3Client, string bucketName)
    {
        if (!await AmazonS3Util.DoesS3BucketExistV2Async(amazonS3Client, bucketName))
        {
            try
            {
                await amazonS3Client.PutBucketAsync(bucketName);
            }
            catch (AmazonS3Exception exception)
            {
                var errorMessage = $"Не удалось создать бакет для хранения данных {bucketName}. " +
                                   $"Код ошибки: {exception.ErrorCode}. " +
                                   $"Сообщение: {exception.Message}";
                throw new ApplicationException(errorMessage, exception);
            }
        }
    }

    public static bool IsSuccessStatusCode(this AmazonWebServiceResponse response)
        => (int)response.HttpStatusCode >= 200 && (int)response.HttpStatusCode < 300;
}