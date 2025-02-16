namespace HwProj.ContentService.API.Configuration;

public class StorageClientConfiguration
{ 
    public string? AccessKeyId { get; set; } 
    public string? SecretKey { get; set; } 
    public string? Region { get; set; } 
    public string? ServiceURL { get; set; } 
    public string? DefaultBucketName { get; set; }
}