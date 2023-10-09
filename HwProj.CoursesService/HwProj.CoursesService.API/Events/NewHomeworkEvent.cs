using System;
using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class NewHomeworkEvent : Event
    {
        public NewHomeworkEvent(string homeworkTitle, string courseName, string[] studentIds, DateTime? deadlineDate, int courseId)
        {
            HomeworkTitle = homeworkTitle;
            CourseName = courseName;
            StudentIds = studentIds;
            DeadlineDate = deadlineDate;
            CourseId = courseId;
        }

        public string HomeworkTitle { get; set; }
        public string CourseName { get; set; }
        public int CourseId { get; set; }
        public DateTime? DeadlineDate { get; set; }
        public string[] StudentIds { get; set; }
    }
}
