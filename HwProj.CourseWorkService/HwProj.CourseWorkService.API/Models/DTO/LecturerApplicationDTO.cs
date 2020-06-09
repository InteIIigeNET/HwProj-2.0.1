namespace HwProj.CourseWorkService.API.Models.DTO
{
    public class LecturerApplicationDTO
    {
        public long Id { get; set; }

        public long CourseWorkId { get; set; }
        public string CourseWorkTitle { get; set; }
        public string CourseWorkOverview { get; set; }

        public string StudentName { get; set; }
        public int StudentGroup { get; set; }

        public string Message { get; set; }
        public string Date { get; set; }
    }
}
