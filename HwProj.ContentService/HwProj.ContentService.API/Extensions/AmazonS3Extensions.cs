using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Util;

namespace HwProj.ContentService.API.Extensions;

public static class AmazonS3Extensions
{
    public static async Task CreateBucketIfNotExists(this IAmazonS3 amazonS3Client, string bucketName)
    {
        var doesBucketExist = false;
        try
        {
            doesBucketExist = await AmazonS3Util.DoesS3BucketExistV2Async(amazonS3Client, bucketName);
        }
        finally
        {
            if (!doesBucketExist)
            {
                var result = await amazonS3Client.PutBucketAsync(bucketName);
                if (result.HttpStatusCode != System.Net.HttpStatusCode.OK)
                {
                    throw new ApplicationException($"Не удалось создать бакет {bucketName} для хранения данных");
                }
            }
        }
    }

    public static bool IsSuccessStatusCode(this AmazonWebServiceResponse response)
        => (int)response.HttpStatusCode >= 200 && (int)response.HttpStatusCode < 300;
}