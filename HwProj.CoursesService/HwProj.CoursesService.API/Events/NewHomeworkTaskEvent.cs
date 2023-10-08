using System;
using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class NewHomeworkTaskEvent : ScheduleEvent
    {
        public NewHomeworkTaskEvent(string taskTitle, long taskId, DateTime? deadline,
            DateTime publicationDate,CourseDTO course, Type type)
            : base(taskId, publicationDate, type)
        {
            TaskTitle = taskTitle;
            TaskId = taskId;
            Deadline = deadline;
            Course = course;
        }

        public string TaskTitle { get; set; }
        public long TaskId { get; set; }
        public DateTime? Deadline { get; set; }
        public CourseDTO Course { get; set; }
    }
}