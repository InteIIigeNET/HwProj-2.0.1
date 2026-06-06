using HwProj.EventBus.Client;

namespace HwProj.NotificationService.Events.CoursesService
{
    public class RegistrationRequestRejectedEvent : Event
    {
        public string Email { get; set; }
        
        public string Name { get; set; }
        
        public string Surname { get; set; }
        
        public string RejectReason { get; set; }
    }
}