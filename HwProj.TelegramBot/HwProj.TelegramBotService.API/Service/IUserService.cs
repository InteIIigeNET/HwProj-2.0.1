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

        Task<UserTelegram> TelegramUserModelByStudentId(string studentId);

        /*Task<UserTelegram> AddTaskIdToSentSolution(long chatId, long taskId);*/

        Task DeleteUser(Update update);
    }
}