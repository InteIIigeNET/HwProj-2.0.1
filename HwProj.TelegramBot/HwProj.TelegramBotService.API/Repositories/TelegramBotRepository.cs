using System.Linq;
using System.Threading.Tasks;
using HwProj.Models.TelegramBotService;
using HwProj.Repositories;
using HwProj.TelegramBotService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HwProj.TelegramBotService.API.Repositories
{
    public class TelegramBotRepository : CrudRepository<UserTelegram, long>, ITelegramBotRepository
    {
        public TelegramBotRepository(TelegramBotContext context)
            : base(context)
        {
        }

        public IQueryable<UserTelegram> GetUserTelegramByChatId(long chatId)
        {
            return Context.Set<UserTelegram>().Where(h => h.ChatId == chatId);
        }
    }
}