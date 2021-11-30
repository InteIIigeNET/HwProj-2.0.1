using Microsoft.EntityFrameworkCore;

namespace HwProj.TelegramBotService.API.Models
{
    public class TelegramBotContext : DbContext
    {
        public DbSet<TelegramUserModel> TelegramUser { get; set; }
        
        public TelegramBotContext(DbContextOptions<TelegramBotContext> options) 
            : base(options)
        {
        }
        
    }
}