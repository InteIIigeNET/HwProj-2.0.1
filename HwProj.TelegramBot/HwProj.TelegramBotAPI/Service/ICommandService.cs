using System.Threading.Tasks;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotAPI.Service
{
    public interface ICommandService
    {
        Task Execute(Update update);
    }
}