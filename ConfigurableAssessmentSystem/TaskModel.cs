using System;

namespace ConfigurableAssessmentSystem
{
    public class TaskModel
    {
        public int MaxRating { get; set; }

        public DateTime? DeadlineDate { get; set; }
        
        public DateTime? TimeForCorrection { get; set; }
    }
}