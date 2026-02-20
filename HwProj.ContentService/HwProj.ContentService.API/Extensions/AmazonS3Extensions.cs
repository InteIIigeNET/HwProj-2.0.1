using Amazon.Runtime;

namespace HwProj.ContentService.API.Extensions;

public static class AmazonS3Extensions
{
    public static bool IsSuccessStatusCode(this AmazonWebServiceResponse response)
        => (int)response.HttpStatusCode >= 200 && (int)response.HttpStatusCode < 300;
}