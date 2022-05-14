using System.Threading.Tasks;
using HwProj.Models.TelegramBotService;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotService.Client
{
    public interface ITelegramBotServiceClient
    {
        Task<(bool, long)> CheckUser(string studentId);
    }
}