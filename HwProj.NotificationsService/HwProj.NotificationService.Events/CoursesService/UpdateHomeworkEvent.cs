using HwProj.EventBus.Client;

namespace HwProj.NotificationService.Events.CoursesService
{
    public class UpdateHomeworkEvent : Event
    {
        public UpdateHomeworkEvent(string homeworkTitle, long homeworkId, long courseId, string courseName, string[] studentIds)
        {
            CourseId = courseId;
            HomeworkTitle = homeworkTitle;
            HomeworkId = homeworkId;
            StudentIds = studentIds;
            CourseName = courseName;
        }

        public string HomeworkTitle { get; set; }
        public long HomeworkId { get; set; }
        public string[] StudentIds { get; set; }
        public long CourseId { get; set; }
        public string CourseName { get; set; }
    }
}
