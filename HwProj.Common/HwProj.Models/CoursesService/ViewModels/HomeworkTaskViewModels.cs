using System;
using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class HomeworkTaskViewModel
    {
        public long Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public int MaxRating { get; set; }

        public DateTime DeadlineDate { get; set; }

        public DateTime PublicationDate { get; set; }

        public long HomeworkId { get; set; }
    }

    public class CreateTaskViewModel
    {
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Title { get; set; }
        public string Description { get; set; }

        public DateTime DeadlineDate { get; set; }

        public DateTime PublicationDate { get; set; }

        [Required]
        public int MaxRating { get; set; }
    }
}
