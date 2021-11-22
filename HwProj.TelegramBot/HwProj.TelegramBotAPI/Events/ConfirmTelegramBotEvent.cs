using HwProj.EventBus.Client;
using HwProj.TelegramBotAPI.Models;

namespace HwProj.TelegramBotAPI.Events
{
    public class ConfirmTelegramBotEvent : Event
    {
        public TelegramUserModel TelegramUserModel { get; set; }
        
        public string Code { get; set; }
    }
}