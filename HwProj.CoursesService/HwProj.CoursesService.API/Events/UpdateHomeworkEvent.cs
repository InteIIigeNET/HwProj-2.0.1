using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class UpdateHomeworkEvent : Event
    {
        public UpdateHomeworkEvent(string homeworkTitle, long courseId, string[] studentIds, string courseName)
        {
            CourseId = courseId;
            HomeworkTitle = homeworkTitle;
            StudentIds = studentIds;
            CourseName = courseName;
        }

        public string HomeworkTitle { get; set; }
        public string[] StudentIds { get; set; }
        public long CourseId { get; set; }
        public string CourseName { get; set; }
    }
}
