using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class UpdateHomeworkEvent : Event
    {
        public UpdateHomeworkEvent(HomeworkViewModel homework, int courseId, string[] studentIds, string courseName)
        {
            CourseId = courseId;
            Homework = homework;
            StudentIds = studentIds;
            CourseName = courseName;
        }

        public HomeworkViewModel Homework { get; set; }
        public string[] StudentIds { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; }
    }
}
