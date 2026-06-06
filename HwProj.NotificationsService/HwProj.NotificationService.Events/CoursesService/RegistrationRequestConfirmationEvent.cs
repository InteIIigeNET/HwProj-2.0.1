using HwProj.EventBus.Client;

namespace HwProj.NotificationService.Events.CoursesService
{
    public class RegistrationRequestConfirmationEvent : Event
    {
        public string Email { get; set; }
        
        public string Name { get; set; }
        
        public string Surname { get; set; }
        
        public string Token { get; set; }
    }
}