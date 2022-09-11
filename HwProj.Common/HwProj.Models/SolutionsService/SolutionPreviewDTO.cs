using System;

namespace HwProj.Models.SolutionsService
{
    public class SolutionPreviewDto
    {
        public string StudentId { get; set; }

        public long TaskId { get; set; }

        public DateTime PublicationDate { get; set; }
        public bool IsFirstTry { get; set; }
    }
}
