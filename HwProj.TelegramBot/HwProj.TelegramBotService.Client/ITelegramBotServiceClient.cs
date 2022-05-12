using System.Threading.Tasks;
using HwProj.Models.TelegramBotService;

namespace HwProj.TelegramBotService.Client
{
    public interface ITelegramBotServiceClient
    {
        Task<bool> CheckUser(string studentId);
        Task<long> GetTelegramUserChatId(string studentId);
    }
}