using System.Threading.Tasks;
using HwProj.Models.Result;
using HwProj.TelegramBotService.API.Models;

namespace HwProj.TelegramBotService.Client
{
    public interface ITelegramBotServiceClient
    {
        Task<TelegramUserModel> GetTelegramUser(string studentId);
    }
}