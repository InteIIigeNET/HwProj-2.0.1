using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class UpdateHomeworkEvent : Event
    {
        public HomeworkViewModel Homework { get; set; }
        public CourseViewModel Course { get; set; }

        public UpdateHomeworkEvent(HomeworkViewModel homework, CourseViewModel course)
        {
            Homework = homework;
            Course = course;
        }
    }
}
