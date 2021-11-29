using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class NewHomeworkEvent : Event
    {
        public NewHomeworkEvent(string homework, CourseViewModel course)
        {
            Homework = homework;
            Course = course;
        }

        public string Homework { get; set; }
        public CourseViewModel Course { get; set; }
    }
}
