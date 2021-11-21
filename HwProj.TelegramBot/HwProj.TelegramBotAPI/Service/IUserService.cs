using System.Threading.Tasks;
using HwProj.TelegramBotAPI.Models;
using Telegram.Bot.Types;

namespace HwProj.TelegramBotAPI.Service
{
    public interface IUserService
    {
        Task<TelegramUserModel> GetOrCreateChatId(Update update);
    }
}