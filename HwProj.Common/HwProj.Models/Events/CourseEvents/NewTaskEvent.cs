using System;
using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.Events.CourseEvents
{
    public class NewTaskEvent : Event
    {
        public string TaskTitle { get; set; }
        
        public long TaskId { get; set; }
        
        public DateTime? Deadline { get; set; }
        
        public DateTime PublicationDate { get; set; }
        
        public CourseDTO Course { get; set; }
        

        public NewTaskEvent(string taskTitle, long taskId, DateTime? deadline,
            DateTime publicationDate, CourseDTO course)
        {
            TaskTitle = taskTitle;
            TaskId = taskId;
            Deadline = deadline;
            PublicationDate = publicationDate;
            Course = course;
        }
    }
}