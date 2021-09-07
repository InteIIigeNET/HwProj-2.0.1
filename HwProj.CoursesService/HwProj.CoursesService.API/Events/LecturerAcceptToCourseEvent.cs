using HwProj.EventBus.Client;
using HwProj.Models.AuthService.DTO;

namespace HwProj.CoursesService.API.Events
{
    public class LecturerAcceptToCourseEvent : Event
    {
        public long CourseId { get; set; }
        public string CourseName { get; set; }
        public string MentorIds { get; set; }
        public string StudentId { get; set; }
        public bool IsAccepted { get; set; }

        public AccountDataDto Student { get; set; }
    }
}