using System;

namespace HwProj.APIGateway.API.Models.Tasks
{
    public class GroupTaskWithoutGroupInSolutionViewModel
    {
        public long TaskId { get; set; }
        public string TaskTitle { get; set; }
        public string CourseTitle { get; set; }
        public DateTime PublicationDate { get; set; }
    }
}