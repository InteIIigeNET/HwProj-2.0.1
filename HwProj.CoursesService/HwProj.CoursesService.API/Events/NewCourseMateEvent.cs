using HwProj.EventBus.Client;

namespace HwProj.CoursesService.API.Events
{
    public class NewCourseMateEvent : Event
    {
        public long CourseId { get; set; }
        public string CourseName { get; set; }
        public string MentorId { get; set; }
        public string StudentId { get; set; }
        public bool IsAccepted { get; set; }
    }
}