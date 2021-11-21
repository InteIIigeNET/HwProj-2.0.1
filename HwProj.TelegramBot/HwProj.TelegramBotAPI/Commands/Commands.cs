using System.Threading.Tasks;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotAPI.Commands
{
    public abstract class Commands
    {
        public abstract string Name { get; }
        
        public abstract Task ExecuteAsync(Update update);
    }
}