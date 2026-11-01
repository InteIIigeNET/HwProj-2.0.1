namespace HwProj.NotificationsService.API.Services.Digest
{
    public class DigestEmail
    {
        public DigestEmail(string email, string recipientName, DigestMessage message)
        {
            Email = email;
            RecipientName = recipientName;
            Message = message;
        }

        public string Email { get; }
        public string RecipientName { get; }
        public DigestMessage Message { get; }
    }
}
