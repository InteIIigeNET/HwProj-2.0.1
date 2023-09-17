using System;
using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class NewHomeworkEvent : Event
    {
        public string Homework { get; set; }
        public CourseDTO Course { get; set; }
        public DateTime? Deadline { get; set; }

        public NewHomeworkEvent(string homework, CourseDTO course, DateTime? deadline)
        {
            Homework = homework;
            Course = course;
            Deadline = deadline;
        }
    }
}
