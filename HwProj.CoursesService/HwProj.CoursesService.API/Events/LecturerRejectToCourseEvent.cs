using HwProj.EventBus.Client;
using HwProj.Models.AuthService.DTO;

namespace HwProj.CoursesService.API.Events
{
    public class LecturerRejectToCourseEvent : Event
    {
        public long CourseId { get; set; }
        public string CourseName { get; set; }
        public string MentorId { get; set; }
        public string StudentId { get; set; }
        public bool IsAccepted { get; set; }

        public AccountDataDto student { get; set; }
    }
}