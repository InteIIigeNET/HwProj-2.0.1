using System;

namespace HwProj.Models.CoursesService.ViewModels
{
    public class HomeworkTaskViewModel
    {
        public long Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public int MaxRating { get; set; }
        
        public bool HasDeadline { get; set; }
        
        public DateTime? DeadlineDate { get; set; }
        
        public bool IsDeadlineStrict { get; set; }
        
        public bool CanSendSolution { get; set; }

        public DateTime PublicationDate { get; set; }

        public long HomeworkId { get; set; }

        public void PutPossibilityForSendingSolution()
        {
            if (!IsDeadlineStrict || DateTime.Now <= DeadlineDate)
            {
                CanSendSolution = true;
            }
        }
    }

    public class CreateTaskViewModel
    {
        public string Title { get; set; }
        public string Description { get; set; }
        
        public bool HasDeadline { get; set; }
        
        public DateTime? DeadlineDate { get; set; }
        
        public bool IsDeadlineStrict { get; set; }

        public DateTime PublicationDate { get; set; }

        public int MaxRating { get; set; }
    }
}
