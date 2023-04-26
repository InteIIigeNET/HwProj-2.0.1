using System;
using System.Collections.Generic;
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
        
        public List<DeadlineViewModel> Deadlines { get; set; } = new();

        [JsonProperty] public bool CanSendSolution => Deadlines == null || !Deadlines.Exists(deadline => deadline.IsStrict && DateTimeUtils.GetMoscowNow() <= deadline.DateTime);

        public DateTime PublicationDate { get; set; }

        public long HomeworkId { get; set; }

        public bool IsDeferred { get; set; }
    }

    public class CreateTaskViewModel
    {
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Title { get; set; }

        public string Description { get; set; }

        public List<AddDeadlineViewModel> Deadlines { get; set; } = new();

        public DateTime PublicationDate { get; set; }

        [Required] public int MaxRating { get; set; }

        public void InitializeDeadline()
        {
            if (Deadlines == null)
            {
                Deadlines = new List<AddDeadlineViewModel>();
            }
        }
    }
}
