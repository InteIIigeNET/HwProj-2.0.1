using System.Threading.Tasks;
using HwProj.TelegramBotService.API.Models;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotService.API.Service
{
    public interface IUserService
    {
        Task<TelegramUserModel> GetOrCreateChatId(Update update);

        Task<TelegramUserModel> GetTelegramUserModelByStudentId(string studentId);
        
        Task<TelegramUserModel> GetTelegramUserModelByChatId(long ChatId);
    }
}