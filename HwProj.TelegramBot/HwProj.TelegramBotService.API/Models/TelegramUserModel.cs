using HwProj.Repositories;

namespace HwProj.TelegramBotService.API.Models
{
    public class TelegramUserModel /*: IEntity<long>*/
    {
        public long Id { get; set; }
        
        public long ChatId { get; set; }

        public string AccountId { get; set; }
        
        public bool IsLecture { get; set; }
        
        public bool IsRegistered { get; set; }
        
        public string Code { get; set; }
        
        public string Operation { get; set; }
    }
}