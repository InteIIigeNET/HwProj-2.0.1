using System;

namespace ConfigurableAssessmentSystem
{
    public class AssessmentModel
    {
        public string TaskName { get; set; }
        
        public int MaxRating { get; set; }
        
        public bool HasDeadline { get; set; }
        
        public DateTime? DeadlineDate { get; set; }
        
        public bool IsDeadlineStrict { get; set; }
        
        public DateTime TaskPublicationDate { get; set; }
        
        public DateTime SolutionPublicationDate { get; set; }

        public int SolutionRating { get; set; }
    }
}