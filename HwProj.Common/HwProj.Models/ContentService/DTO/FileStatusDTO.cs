namespace HwProj.Models.ContentService.DTO
{
    public class FileStatusDTO
    {
        public long FileId { get; set; }
        public string FileName { get; set; }
        public string Status { get; set; }
        public decimal SizeInKB { get; set; }
    }
}