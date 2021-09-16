using System;
using HwProj.EventBus.Client;

namespace HwProj.CoursesService.API.Events
{
    public class RequestMaxRatingEvent : Event
    {
        public long TaskId { get; set; }
        public long SolutionId { get; set; }
        public string StudentId { get; set; }
        public DateTime SolutionDate { get; set; }

        public RequestMaxRatingEvent(long taskId, long solutionId, string studentId,  DateTime solutionDate)
        {
            TaskId = taskId;
            SolutionId = solutionId;
            StudentId = studentId;
            SolutionDate = solutionDate;
        }
    }
}
