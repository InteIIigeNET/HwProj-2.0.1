namespace HwProj.TelegramBotService.API.Models
{
    public class TelegramUserModel
    {
        public long Id { get; set; }
        
        public string StudentId { get; set; }
        
        public long ChatId { get; set; }
        
        public bool IsRegister { get; set; }
    }
}