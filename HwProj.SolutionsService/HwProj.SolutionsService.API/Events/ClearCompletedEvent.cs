using System;
using System.Collections.Generic;
using HwProj.EventBus.Client;

namespace HwProj.SolutionsService.API.Events
{
    public class ClearCompletedEvent : Event
    {
        public long TaskId { get; set; }
        public List<string> AffectedStudents { get; set; }
        public TimeSpan DaysFromExpiration { get; set; }

        public ClearCompletedEvent(long taskId, List<string> affectedStudents, TimeSpan daysFromExpiration)
        {
            TaskId = taskId;
            AffectedStudents = affectedStudents;
            DaysFromExpiration = daysFromExpiration;
        }
    }
}
