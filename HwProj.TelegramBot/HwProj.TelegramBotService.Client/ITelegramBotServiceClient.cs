using System.Threading.Tasks;
using HwProj.TelegramBotService.API.Models;

namespace HwProj.TelegramBotService.Client
{
    public interface ITelegramBotServiceClient
    {
        Task<TelegramUserModel> GetTelegramUser(string studentId);
    }
}