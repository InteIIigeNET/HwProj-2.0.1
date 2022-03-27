using HwProj.Models.TelegramBotService;
using Microsoft.EntityFrameworkCore;

namespace HwProj.TelegramBotService.API.Models
{
    public sealed class TelegramBotContext : DbContext
    {
        public DbSet<UserTelegram> TelegramUser { get; set; }
        
        public TelegramBotContext(DbContextOptions<TelegramBotContext> options) 
            : base(options)
        {
            Database.EnsureCreated();
        }
        
    }
}