using System.Threading.Tasks;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotService.API.Commands
{
    public abstract class Commands
    {
        public abstract string Name { get; }
        
        public abstract Task ExecuteAsync(Update update);
    }
}