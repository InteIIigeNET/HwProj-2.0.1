using System.Threading.Tasks;
using HwProj.Models.TelegramBotService;
using HwProj.TelegramBotService.API.Models;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotService.API.Service
{
    public interface IUserTelegramService
    {
        Task<UserTelegram> CreateUser(long chatId);
        Task<UserTelegram> AddEmailToUser(long chatId, string message);
        Task<UserTelegram> AddFinishUser(long chatId, string message);
        Task<UserTelegram> UserByUpdate(Update update);
        Task<(bool, long)> CheckTelegramUserModelByStudentId(string studentId);
        Task<long> ChatIdByStudentId(string studentId);
        Task<UserTelegram> AddTaskIdAndWaitPullRequest(Update update, long taskId);
        Task<UserTelegram> AddGitHubUrlToTask(Update update, string url);
        Task DeleteUser(Update update);
    }
}