using MailKit.Net.Smtp;
using MimeKit;
using System.Threading.Tasks;

namespace HwProj.AuthService.API
{
    public class EmailService
    {
        public async Task SendEmailAsync(string email, string subject, string message)
        {
            var from = new MailboxAddress("HwProj", "_@gmail.com");
            var to = new MailboxAddress(email);
            var emailMessage = new MimeMessage(from, to, subject, message);

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync("smtp.google.com");
                await client.AuthenticateAsync("_@gmail.com", "password");
                await client.SendAsync(emailMessage);
                await client.DisconnectAsync(true);
            }
        }
    }
}
