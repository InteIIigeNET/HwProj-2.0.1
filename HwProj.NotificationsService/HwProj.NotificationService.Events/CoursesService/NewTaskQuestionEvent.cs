using HwProj.EventBus.Client;

namespace HwProj.NotificationService.Events.CoursesService
{
    public class NewTaskQuestionEvent : Event
    {
        public long CourseId { get; set; }
        public string CourseName { get; set; }
        public long TaskId { get; set; }
        public string TaskTitle { get; set; }
        public string StudentId { get; set; }
        public string Text { get; set; }
        public bool IsPrivate { get; set; }

        /// <summary> Преподаватели курса, которым виден студент </summary>
        public string[] MentorIds { get; set; }
    }
}
