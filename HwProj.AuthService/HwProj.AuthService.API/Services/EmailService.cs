using MimeKit;
using MailKit.Net.Smtp;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;

namespace HwProj.AuthService.API.Services
{
	public class EmailService
	{
		private readonly AppSettings appSettings;

		public EmailService(IOptions<AppSettings> appSettings)
			=> this.appSettings = appSettings.Value;

		/// <summary>
		/// Отправляет ссылку для подтверждения Email на почту
		/// </summary>
		public async Task SendEmailForConfirmation(string address, string url)
		{
			var message = new MimeMessage();
			message.From.Add(new MailboxAddress("HwProj", appSettings.Email));
			message.To.Add(new MailboxAddress(address));
			message.Subject = "Подтверждение почты";
			message.Body = new TextPart(MimeKit.Text.TextFormat.Html)
			{
				Text = $"<a href='{url}'>Нажмите для подтверждения</a>"
			};

			using (var client = new SmtpClient())
			{
				await client.ConnectAsync("smtp.gmail.com", 587, false);
				await client.AuthenticateAsync(appSettings.Email, appSettings.Password);
				await client.SendAsync(message);
				await client.DisconnectAsync(true);
			}
		}
	}
}