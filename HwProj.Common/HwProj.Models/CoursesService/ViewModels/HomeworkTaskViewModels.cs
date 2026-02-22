using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class HomeworkTaskViewModel
    {
        public long Id { get; set; }

        public string Title { get; set; }

        public string[] Tags { get; set; }

        public string Description { get; set; }

        public int MaxRating { get; set; }

        public bool? HasDeadline { get; set; }

        public DateTime? DeadlineDate { get; set; }

        public bool? IsDeadlineStrict { get; set; }

        [JsonProperty] public bool CanSendSolution => (!IsDeadlineStrict ?? false) || DateTime.UtcNow <= DeadlineDate;

        public DateTime? PublicationDate { get; set; }

        public bool PublicationDateNotSet { get; set; }

        public bool DeadlineDateNotSet { get; set; }

        public long HomeworkId { get; set; }

        public bool IsGroupWork { get; set; }

        public bool IsDeferred { get; set; }

        public List<CriterionViewModel>? Criteria { get; set; } = new List<CriterionViewModel>();
    }

    public class HomeworkTaskForEditingViewModel
    {
        public HomeworkTaskViewModel Task { get; set; }

        public HomeworkViewModel Homework { get; set; }
    }

    public class PostTaskViewModel
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

        public bool IsBonusExplicit { get; set; }

        public ActionOptions? ActionOptions { get; set; }

        public List<CriterionViewModel> Criteria { get; set; }
    }
}
