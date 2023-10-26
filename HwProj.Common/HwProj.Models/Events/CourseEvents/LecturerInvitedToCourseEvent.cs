using HwProj.EventBus.Client;

namespace HwProj.Events.CourseEvents
{
    public class LecturerInvitedToCourseEvent : Event
    {
        public long CourseId { get; set; }
        public string CourseName { get; set; }
        public string MentorId { get; set; }
        public string MentorEmail { get; set; }
    }
}
