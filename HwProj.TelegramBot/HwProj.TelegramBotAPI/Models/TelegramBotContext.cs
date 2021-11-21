using Microsoft.EntityFrameworkCore;

namespace HwProj.TelegramBotAPI.Models
{
    public class TelegramBotContext : DbContext
    {
        public TelegramBotContext(DbContextOptions<TelegramBotContext> options) : base(options)
        {
        }
        
        public DbSet<TelegramUserModel> TelegramUser { get; set; }
    }
}