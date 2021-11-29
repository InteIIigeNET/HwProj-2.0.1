namespace HwProj.TelegramBotService.API.Models
{
    public class TelegramUserModel
    {
        public long Id { get; set; }
        
        public long ChatId { get; set; }
     
        public string AccountId { get; set; }
        
        public bool IsLecture { get; set; }
        
        public bool IsRegistered { get; set; }
    }
}