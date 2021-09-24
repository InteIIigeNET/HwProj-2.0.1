using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class NewHomeworkEvent : Event
    {
        public string Homework { get; set; }
        public CourseViewModel Course { get; set; }

        public NewHomeworkEvent(string homework, CourseViewModel course)
        {
            Homework = homework;
            Course = course;
        }
    }
}
