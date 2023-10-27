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
        
        //закладываюсь, что дату публикации не будут менять после публикации
        public DateTime PreviousPublicationDate { get; set; }
        
        public DateTime PublicationDate { get; set; }
        
        public DateTime? Deadline { get; set; }
        
        public UpdateTaskEvent(CourseDTO course, string taskTitle, long taskId, DateTime previousPublicationDate, DateTime publicationDate, DateTime? deadline)
        {
            Course = course;
            TaskTitle = taskTitle;
            TaskId = taskId;
            PreviousPublicationDate = previousPublicationDate;
            PublicationDate = publicationDate;
            Deadline = deadline;
        }
    }
}
