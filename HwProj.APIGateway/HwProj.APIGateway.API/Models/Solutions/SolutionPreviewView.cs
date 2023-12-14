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
        public string TaskTitle { get; set; }
        public long TaskId { get; set; }
        public DateTime PublicationDate { get; set; }
        public long? GroupId { get; set; }
        public bool IsFirstTry { get; set; }
        public bool SentAfterDeadline { get; set; }
        public bool IsCourseCompleted { get; set; }
    }

    public class UnratedSolutionPreviews
    {
        public SolutionPreviewView[] UnratedSolutions { get; set; }
    }
}
