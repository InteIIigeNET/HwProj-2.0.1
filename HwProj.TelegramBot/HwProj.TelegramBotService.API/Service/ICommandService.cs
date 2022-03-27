using System.Threading.Tasks;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotService.API.Service
{
    public interface ICommandService
    {
        Task Execute(Update update);
    }
}