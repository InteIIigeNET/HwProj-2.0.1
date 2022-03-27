using System.Threading.Tasks;
using Telegram.Bot.Types;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.TelegramBotService.API.Commands
{
    public abstract class Commands
    {
        public abstract string Name { get; }
        
        public abstract Task ExecuteAsync(Update update);

        protected InlineKeyboardButton GetButton(string text, string callbackData)
            => new()
            { 
                Text = text,
                CallbackData = callbackData
            };
    }
}