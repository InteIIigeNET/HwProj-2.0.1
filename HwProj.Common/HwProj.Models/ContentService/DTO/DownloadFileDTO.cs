using System.IO;

namespace HwProj.Models.ContentService.DTO
{
    public class DownloadFileDTO
    {
        public Stream Stream { get; set; }
        
        public string ContentType { get; set; }
        
        public string FileName { get; set; }
    }
}