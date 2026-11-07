using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.Models.Result;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services.Messages;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HwProj.NotificationsService.API.Services.Digest
{
    public interface IDigestService
    {
        /// <summary> Рассылает всем дайжесты за сутки, предшествующие <paramref name="until"/> </summary>
        Task SendDigestsAsync(DateTime until, CancellationToken cancellationToken);

        /// <summary>
        /// Отправляет пользователю сводку за последние сутки по его запросу с сайта.
        /// Ежедневную рассылку это не затрагивает: вечером дайжест придёт как обычно
        /// </summary>
        Task<Result> SendRequestedDigestAsync(string userId);
    }

    public class DigestService : IDigestService
    {
        /// <summary>
        /// Дайжест — это всегда события за последние сутки, прочитанные в ленте или нет.
        /// Что-то отмечать как «отправленное» не нужно: соседние ежедневные рассылки не пересекаются по времени
        /// </summary>
        private static readonly TimeSpan Period = TimeSpan.FromDays(1);

        private const string RequestCacheKeyPrefix = "digest-request:";

        private readonly INotificationsRepository _notificationsRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache;
        private readonly DigestOptions _options;
        private readonly string _siteUrl;
        private readonly ILogger<DigestService> _logger;

        public DigestService(
            INotificationsRepository notificationsRepository,
            IAuthServiceClient authServiceClient,
            IEmailService emailService,
            IMemoryCache cache,
            IOptions<DigestOptions> options,
            IConfiguration configuration,
            ILogger<DigestService> logger)
        {
            _notificationsRepository = notificationsRepository;
            _authServiceClient = authServiceClient;
            _emailService = emailService;
            _cache = cache;
            _options = options.Value;
            _siteUrl = configuration.GetSection("Notification")["Url"];
            _logger = logger;
        }

        public async Task SendDigestsAsync(DateTime until, CancellationToken cancellationToken)
        {
            var since = until - Period;

            var recipientIds = await _notificationsRepository.GetDigestRecipientIdsAsync(since, until);
            var batches = recipientIds.Chunk(Math.Max(1, _options.BatchSize)).ToArray();
            _logger.LogInformation($"Sending digests to {recipientIds.Length} recipients in {batches.Length} batches");

            for (var i = 0; i < batches.Length; i++)
            {
                if (i > 0) await Task.Delay(_options.BatchDelay, cancellationToken);

                try
                {
                    await SendBatchAsync(batches[i], since, until, cancellationToken);
                }
                catch (Exception ex) when (!(ex is OperationCanceledException))
                {
                    _logger.LogError(ex, $"Error while sending digest batch {i + 1} of {batches.Length}");
                }
            }
        }

        public async Task<Result> SendRequestedDigestAsync(string userId)
        {
            var now = DateTime.UtcNow;
            var cacheKey = RequestCacheKeyPrefix + userId;

            // Ограничиваем частоту: иначе кнопкой на сайте можно завалить ящик письмами,
            // а почтовый сервис — заблокировать отправителя за спам
            if (_cache.TryGetValue(cacheKey, out DateTime allowedAt))
            {
                var minutes = Math.Max(1, (int)Math.Ceiling((allowedAt - now).TotalMinutes));
                return Result.Failed("Сводка уже отправлена на почту. Запросить её снова можно через " +
                                     $"{minutes} {NotificationHtml.Plural(minutes, "минуту", "минуты", "минут")}");
            }

            // Слот занимаем до отправки, чтобы повторное нажатие во время отправки не дало второе письмо
            var hasCooldown = _options.RequestCooldown > TimeSpan.Zero;
            if (hasCooldown) _cache.Set(cacheKey, now + _options.RequestCooldown, _options.RequestCooldown);

            var result = await TrySendRequestedDigestAsync(userId, now);
            if (!result.Succeeded && hasCooldown) _cache.Remove(cacheKey);
            return result;
        }

        private async Task<Result> TrySendRequestedDigestAsync(string userId, DateTime until)
        {
            var notifications =
                await _notificationsRepository.GetDigestNotificationsAsync(new[] { userId }, until - Period, until);
            if (!notifications.Any()) return Result.Failed("За последние сутки в ваших курсах ничего не произошло");

            var account = await _authServiceClient.GetAccountData(userId);
            if (string.IsNullOrEmpty(account?.Email)) return Result.Failed("В профиле не указана почта");

            var message = DigestBuilder.Build(notifications.Select(DigestItem.FromNotification).ToArray(), until,
                _siteUrl);
            message.IsRequested = true;

            var digest = new DigestEmail(account.Email, account.Name, message);
            var sent = await _emailService.SendDigestsAsync(new[] { digest }, CancellationToken.None);

            return sent.Any()
                ? Result.Success()
                : Result.Failed("Не удалось отправить письмо, попробуйте позже");
        }

        private async Task SendBatchAsync(string[] recipientIds, DateTime since, DateTime until,
            CancellationToken cancellationToken)
        {
            var notifications = (await _notificationsRepository.GetDigestNotificationsAsync(recipientIds, since, until))
                .ToLookup(n => n.Owner);
            var accounts = (await _authServiceClient.GetAccountsData(recipientIds))
                .Where(account => account != null)
                .ToDictionary(account => account.UserId);

            var digests = new List<DigestEmail>();
            foreach (var recipientId in recipientIds)
            {
                var items = notifications[recipientId].Select(DigestItem.FromNotification).ToArray();
                if (!items.Any()) continue;

                // Письмо отправить некому: пользователь удалён или у него нет почты
                if (!accounts.TryGetValue(recipientId, out var account) || string.IsNullOrEmpty(account.Email))
                    continue;

                digests.Add(new DigestEmail(account.Email, account.Name, DigestBuilder.Build(items, until, _siteUrl)));
            }

            await _emailService.SendDigestsAsync(digests, cancellationToken);
        }
    }
}
