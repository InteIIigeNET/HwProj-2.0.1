using System;
using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class NewHomeworkTaskEvent : Event
    {
        public string TaskTitle { get; set; }
        
        public long TaskId { get; set; }
        
        public DateTime? Deadline { get; set; }
        
        public DateTime PublicationDate { get; set; }
        
        public CourseDTO Course { get; set; }
        

        public NewHomeworkTaskEvent(string taskTitle, long taskId, DateTime? deadline,
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