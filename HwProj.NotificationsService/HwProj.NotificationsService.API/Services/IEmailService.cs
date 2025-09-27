using HwProj.Models.NotificationsService;
using System.Threading.Tasks;
using Notification = HwProj.NotificationsService.API.Models.Notification;

namespace HwProj.NotificationsService.API.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(Notification notification, string email, string topic);
    }
}