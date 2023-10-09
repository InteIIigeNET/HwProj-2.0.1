using System;
using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class NewHomeworkTaskEvent : Event
    {
        public NewHomeworkTaskEvent(string taskTitle, long taskId, DateTime? deadlineDate, string courseName, string[] studentIds, int courseId)
        {
            TaskTitle = taskTitle;
            TaskId = taskId;
            DeadlineDate = deadlineDate;
            CourseName = courseName;
            StudentIds = studentIds;
            CourseId = courseId;
        }

        public string TaskTitle { get; set; }
        public long TaskId { get; set; }
        public DateTime? DeadlineDate { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; }
        public string[] StudentIds { get; set; }
    }
}
