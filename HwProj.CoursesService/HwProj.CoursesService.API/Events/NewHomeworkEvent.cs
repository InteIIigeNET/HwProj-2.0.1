using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class NewHomeworkEvent : Event
    {
        public string Homework { get; set; }
        
        public long HomeworkId { get; set; }
        public CourseViewModel Course { get; set; }

        public NewHomeworkEvent(string homework, long homeworkId, CourseViewModel course)
        {
            Homework = homework;
            homeworkId = homeworkId;
            Course = course;
        }
    }
}
