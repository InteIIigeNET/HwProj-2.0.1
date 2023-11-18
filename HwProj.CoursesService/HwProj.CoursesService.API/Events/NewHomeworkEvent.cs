using System;
using HwProj.EventBus.Client;

namespace HwProj.CoursesService.API.Events
{
    public class NewHomeworkEvent : Event
    {
        public NewHomeworkEvent(string homeworkTitle, string courseName, long courseId, string[] studentIds, DateTime? deadlineDate)
        {
            HomeworkTitle = homeworkTitle;
            CourseName = courseName;
            StudentIds = studentIds;
            DeadlineDate = deadlineDate;
            CourseId = courseId;
        }

        public string HomeworkTitle { get; set; }
        public string CourseName { get; set; }
        public long CourseId { get; set; }
        public DateTime? DeadlineDate { get; set; }
        public string[] StudentIds { get; set; }
    }
}
