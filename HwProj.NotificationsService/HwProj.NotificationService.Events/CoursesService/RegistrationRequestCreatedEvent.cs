using HwProj.EventBus.Client;
using HwProj.Models.CoursesService;

namespace HwProj.NotificationService.Events.CoursesService
{
    public class RegistrationRequestCreatedEvent : Event
    {
        public long RegistrationRequestId { get; set; }
        
        public long? CourseId { get; set; }
        
        public string RequestedRole { get; set; }
        
        public string Email { get; set; }
        
        public string Name { get; set; }
        
        public string Surname { get; set; }

        public string MentorIds { get; set; } = string.Empty;

        public string CourseName { get; set; } = string.Empty;
    }
}