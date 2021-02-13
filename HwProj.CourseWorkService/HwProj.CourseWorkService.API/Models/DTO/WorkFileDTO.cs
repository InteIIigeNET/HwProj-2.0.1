namespace HwProj.CourseWorkService.API.Models.DTO
{
    public class WorkFileDTO
    {
        public long Id { get; set; }
        public long FileTypeId { get; set; }
        public string FileTypeName { get; set; }
        public string FileName { get; set; }
        public string ContentType { get; set; }
    }
}
