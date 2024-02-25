using HwProj.EventBus.Client;

namespace HwProj.Models.Events.CourseEvents
{
    public class NewCourseMateEvent : Event
    {
        public long CourseId { get; set; }
        public string CourseName { get; set; }
        public string MentorIds { get; set; }
        public string StudentId { get; set; }
        public bool IsAccepted { get; set; }

        public override string EventName => "NewCourseMateEvent";
        public override EventCategory Category => EventCategory.Courses;
    }
}
