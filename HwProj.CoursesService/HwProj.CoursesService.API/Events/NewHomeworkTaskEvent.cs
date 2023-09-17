using System;
using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class NewHomeworkTaskEvent : Event
    {
        public NewHomeworkTaskEvent(string taskTitle, long taskId, CourseDTO course)
        {
            TaskTitle = taskTitle;
            TaskId = taskId;
            Course = course;
        }

        public string TaskTitle { get; set; }
        public long TaskId { get; set; }
        public CourseDTO Course { get; set; }
    }
}
