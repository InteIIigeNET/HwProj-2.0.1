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

        Task<TelegramUserModel> UserByUpdate(Update update);

        Task<TelegramUserModel> TelegramUserModelByStudentId(string studentId);
        
        Task DeleteUser(Update update);
    }
}