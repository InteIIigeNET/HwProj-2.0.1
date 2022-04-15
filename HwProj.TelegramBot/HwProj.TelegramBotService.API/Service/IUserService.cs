using System.Threading.Tasks;
using HwProj.Models.TelegramBotService;
using HwProj.TelegramBotService.API.Models;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotService.API.Service
{
    public interface IUserService
    {
        Task<UserTelegram> CreateUser(Update update);
        
        Task<UserTelegram> AddEmailToUser(Update update);
        
        Task<UserTelegram> AddFinishUser(Update update);

        Task<UserTelegram> UserByUpdate(Update update);

        Task<bool> CheckTelegramUserModelByStudentId(string studentId);
        Task<UserTelegram> TelegramUserModelByStudentId(string studentId);
        Task<long> GetChatIdByStudentId(string studentId);

        Task<UserTelegram> AddTaskIdAndWaitPullRequest(Update update, long taskId);

        Task DeleteUser(Update update);
    }
}