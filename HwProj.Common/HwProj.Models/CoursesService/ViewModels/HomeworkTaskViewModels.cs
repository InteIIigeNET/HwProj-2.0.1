using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class HomeworkTaskViewModel
    {
        public long Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public int MaxRating { get; set; }

        public List<DeadlineViewModel> Deadlines { get; set; } = new List<DeadlineViewModel>();
        
        public bool HasDeadline { get; set; }
        
        public bool CanSendSolution { get; set; }

        public DateTime PublicationDate { get; set; }

        public long HomeworkId { get; set; }

        public void PutPossibilityForSendingSolution()
        {
            foreach (var deadline in Deadlines)
            {
                if (deadline.IsStrict && DateTime.UtcNow >= deadline.DateTime)
                {
                    CanSendSolution = false;
                }
            }
        }

        public bool IsDeferred { get; set; }
    }

    public class CreateTaskViewModel
    {
        [Required]
        [RegularExpression(@"^\S+.*", ErrorMessage = "Name shouldn't start with white spaces.")]
        public string Title { get; set; }
        public string Description { get; set; }

        public List<DeadlineViewModel> Deadlines { get; set; } = new List<DeadlineViewModel>();
        
        public bool HasDeadline { get; set; }
        
        public DateTime PublicationDate { get; set; }

        [Required]
        public int MaxRating { get; set; }
        
        public void InitializeDeadline()
        {
            if (!HasDeadline || Deadlines == null)
            {
                HasDeadline = false;
                Deadlines = new List<DeadlineViewModel>();
            }
        }
    }
}
