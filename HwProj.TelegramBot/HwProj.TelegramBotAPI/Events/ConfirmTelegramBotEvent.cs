using HwProj.EventBus.Client;
using HwProj.TelegramBotAPI.Models;

namespace HwProj.TelegramBotAPI
{
    public class ConfirmTelegramBotEvent : Event
    {
        public TelegramUserModel TelegramUserModel { get; set; }
        
        public string Code { get; set; }
    }
}