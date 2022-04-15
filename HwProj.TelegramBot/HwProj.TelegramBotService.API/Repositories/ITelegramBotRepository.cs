using System.Linq;
using System.Threading.Tasks;
using HwProj.Models.TelegramBotService;
using HwProj.Repositories;

namespace HwProj.TelegramBotService.API.Repositories
{
    public interface ITelegramBotRepository : ICrudRepository<UserTelegram, long>
    {
        IQueryable<UserTelegram> GetUserTelegramByChatId(long chatId);
        IQueryable<UserTelegram> GetChatIdTelegramByAccountId(string accountId);
    }
}