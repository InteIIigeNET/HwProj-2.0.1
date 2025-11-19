namespace HwProj.Models.ContentService.DTO
{
    
    public class FileLinkDTO
    {
        public string DownloadUrl { get; set; }
        public long CourseId { get; set; }
        public string CourseUnitType { get; set; }
        public long CourseUnitId { get; set; }
    }
}
