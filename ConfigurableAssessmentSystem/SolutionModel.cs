using System;

namespace ConfigurableAssessmentSystem
{
    public class SolutionModel
    {
        public int Rating { get; set; }

        public DateTime PublicationDate { get; set; }
        
        public DateTime TimeOfAssessmentLastSolution { get; set; }
    }
}