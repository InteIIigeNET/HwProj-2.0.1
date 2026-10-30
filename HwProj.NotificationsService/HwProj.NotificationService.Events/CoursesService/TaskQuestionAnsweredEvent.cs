using HwProj.EventBus.Client;

namespace HwProj.NotificationService.Events.CoursesService
{
    public class TaskQuestionAnsweredEvent : Event
    {
        public long CourseId { get; set; }
        public string CourseName { get; set; }
        public long TaskId { get; set; }
        public string TaskTitle { get; set; }
        public string StudentId { get; set; }
        public string LecturerId { get; set; }
        public string Question { get; set; }
        public string Answer { get; set; }
    }
}
