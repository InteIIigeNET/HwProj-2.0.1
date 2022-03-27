using System.Threading.Tasks;
using HwProj.Models.TelegramBotService;

namespace HwProj.TelegramBotService.Client
{
    public interface ITelegramBotServiceClient
    {
        Task<UserTelegram> GetTelegramUser(string studentId);
    }
}