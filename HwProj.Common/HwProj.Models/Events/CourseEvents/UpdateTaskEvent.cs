using System;
using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.Events.CourseEvents
{
    public class UpdateTaskEvent : Event
    {
        public CourseDTO Course { get; set; }
        
        public string TaskTitle { get; set; }
        
        public long TaskId { get; set; }
        
        public DateTime PublicationDate { get; set; }
        
        public UpdateTaskEvent(CourseDTO course, string taskTitle, long taskId, DateTime publicationDate)
        {
            Course = course;
            TaskTitle = taskTitle;
            TaskId = taskId;
            PublicationDate = publicationDate;
        }
    }
}
