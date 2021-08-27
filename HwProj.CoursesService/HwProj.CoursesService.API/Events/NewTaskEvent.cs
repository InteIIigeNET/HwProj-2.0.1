using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class NewTaskEvent : Event
    {
        public string Homework { get; set; }
        public CourseViewModel Course { get; set; }

        public NewTaskEvent(string homework, CourseViewModel course)
        {
            Homework = homework;
            Course = course;
        }
    }
}
