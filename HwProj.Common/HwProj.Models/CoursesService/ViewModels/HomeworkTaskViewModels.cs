using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class HomeworkTaskViewModel
    {
        public long Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public int MaxRating { get; set; }

        public bool? HasDeadline { get; set; }

        public DateTime? DeadlineDate { get; set; }

        public bool? IsDeadlineStrict { get; set; }

        [JsonProperty] public bool CanSendSolution => (!IsDeadlineStrict ?? false) || DateTimeUtils.GetMoscowNow() <= DeadlineDate;

        public DateTime? PublicationDate { get; set; }

        public long HomeworkId { get; set; }

        public bool IsDeferred { get; set; }
    }

    public class HomeworkTaskForEditingViewModel : HomeworkTaskViewModel
    {
        public HomeworkViewModel Homework { get; set; }
    }

    public class CreateTaskViewModel
    {
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Title { get; set; }

        public string Description { get; set; }

        public bool? HasDeadline { get; set; }

        public DateTime? DeadlineDate { get; set; }

        public bool? IsDeadlineStrict { get; set; }

        public DateTime? PublicationDate { get; set; }

        [Required] public int MaxRating { get; set; }

        public long Id { get; set; }

        public long HomeworkId { get; set; }
    }
}
