using System.Threading.Tasks;
using HwProj.TelegramBotService.API.Models;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotService.API.Service
{
    public interface IUserService
    {
        Task<TelegramUserModel> CreateUser(Update update);
        
        Task<TelegramUserModel> AddEmailToUser(Update update);
        
        Task<TelegramUserModel> AddFinishUser(Update update);

        Task<TelegramUserModel> GetUserByUpdate(Update update);

        Task<TelegramUserModel> GetTelegramUserModelByStudentId(string studentId);
        
        Task DeleteUser(Update update);

        Task<TelegramUserModel> GetTelegramUserModelByChatId(long chatId);
    }
}