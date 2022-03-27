using HwProj.EventBus.Client;
using HwProj.Models.TelegramBotService;
using HwProj.TelegramBotService.API.Models;

namespace HwProj.TelegramBotService.API.Events
{
    public class ConfirmTelegramBotEvent : Event
    {
        public string StudentId { get; }
        
        public string Code { get; }

        public ConfirmTelegramBotEvent(string studentId, string code)
        {
            StudentId = studentId;
            Code = code;
        }
    }
}