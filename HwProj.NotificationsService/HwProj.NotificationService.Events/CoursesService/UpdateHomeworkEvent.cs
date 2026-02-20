using HwProj.EventBus.Client;

namespace HwProj.NotificationService.Events.CoursesService
{
    public class UpdateHomeworkEvent : Event
    {
        public UpdateHomeworkEvent(string homeworkTitle, long courseId, string courseName, string[] studentIds)
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
