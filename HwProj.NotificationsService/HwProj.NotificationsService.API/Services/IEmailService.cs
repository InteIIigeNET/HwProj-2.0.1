using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using HwProj.NotificationsService.API.Services.Digest;
using HwProj.NotificationsService.API.Services.Messages;

namespace HwProj.NotificationsService.API.Services
{
    public interface IEmailService
    {
        /// <param name="recipientName">Имя для приветствия в письме; без него письмо начинается сразу с текста</param>
        Task SendEmailAsync(NotificationMessage message, string email, string recipientName = null);

        /// <summary>
        /// Отправляет дайжесты по одному SMTP-подключению. Ошибка с одним письмом не прерывает остальные
        /// </summary>
        /// <returns>Дайжесты, которые удалось отправить</returns>
        Task<IReadOnlyList<DigestEmail>> SendDigestsAsync(IReadOnlyList<DigestEmail> digests,
            CancellationToken cancellationToken);
    }
}
