namespace HwProj.Models.ContentService.DTO
{
    public class FileInfoDTO
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string Status { get; set; }
        public decimal SizeInKB { get; set; }
        
        public string CourseUnitType { get; set; }
        public long CourseUnitId { get; set; }
    }
}