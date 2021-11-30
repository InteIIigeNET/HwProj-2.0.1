namespace HwProj.TelegramBotService.API.Models
{
    public class TelegramUserResponse
    {
        public long AuthDate { get; set; }
        public string FirstName { get; set; }
        public string Hash { get; set; }
        public long ChatId { get; set; }
        public string LastName { get; set; }
    }
}