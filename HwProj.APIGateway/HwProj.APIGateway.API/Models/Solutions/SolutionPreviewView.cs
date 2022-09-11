using System;
using HwProj.Models.AuthService.DTO;

namespace HwProj.APIGateway.API.Models.Solutions
{
    public class SolutionPreviewView
    {
        public AccountDataDto Student { get; set; }
        public string CourseTitle { get; set; }
        public long CourseId { get; set; }
        public string HomeworkTitle { get; set; }
        public long HomeworkId { get; set; }
        public string TaskTitle { get; set; }
        public long TaskId { get; set; }
        public DateTime PublicationDate { get; set; }
        public bool IsFirstTry { get; set; }
    }

    public class UnratedSolutionPreviews
    {
        public SolutionPreviewView[] UnratedSolutions { get; set; }
    }
}
