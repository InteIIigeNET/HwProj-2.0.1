namespace HwProj.CoursesService.API.Models
{
    public class HomeworkTaskTemplate
    {
        public string Title { get; set; }

        public string Description { get; set; }

        public int MaxRating { get; set; }

        public bool? HasDeadline { get; set; }

        public bool? IsDeadlineStrict { get; set; }

        public bool HasSpecialPublicationDate { get; set; }

        public bool HasSpecialDeadlineDate { get; set; }
    }
}
