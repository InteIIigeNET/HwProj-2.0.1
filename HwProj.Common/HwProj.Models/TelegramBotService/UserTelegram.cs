using HwProj.Repositories;

namespace HwProj.Models.TelegramBotService
{
    public class UserTelegram : IEntity<long>
    {
        public long Id { get; set; }
        
        public long ChatId { get; set; }

        public string AccountId { get; set; }
        
        public bool IsLecture { get; set; }
        
        public bool IsRegistered { get; set; }
        
        public string? Code { get; set; }
        
        public string? Comment { get; set; }
        
        public long? TaskIdToSend { get; set; }
        
        public string? GitHubUrl { get; set; }
        
        public string? Operation { get; set; }
    }
}