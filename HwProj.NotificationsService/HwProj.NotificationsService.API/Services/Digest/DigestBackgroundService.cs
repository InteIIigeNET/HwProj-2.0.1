using System;
using System.Threading;
using System.Threading.Tasks;
using HwProj.NotificationsService.API.Services.Messages;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HwProj.NotificationsService.API.Services.Digest
{
    /// <summary>
    /// Раз в сутки, в <see cref="DigestOptions.SendTime"/> по Москве, рассылает дайжесты за прошедшие сутки.
    /// Если сервис был выключен в момент рассылки, письма за эти сутки не придут — события остаются в ленте
    /// </summary>
    public class DigestBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly DigestOptions _options;
        private readonly ILogger<DigestBackgroundService> _logger;

        public DigestBackgroundService(
            IServiceScopeFactory scopeFactory,
            IOptions<DigestOptions> options,
            ILogger<DigestBackgroundService> logger)
        {
            _scopeFactory = scopeFactory;
            _options = options.Value;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var lastRun = DateTime.UtcNow;
            while (!stoppingToken.IsCancellationRequested)
            {
                var nextRun = GetNextRun(lastRun, _options.SendTime);
                _logger.LogInformation($"Next digest sending is scheduled at {nextRun:u}");

                try
                {
                    var delay = nextRun - DateTime.UtcNow;
                    if (delay > TimeSpan.Zero) await Task.Delay(delay, stoppingToken);

                    // Окно дайжеста отсчитываем от запланированного времени, а не от фактического:
                    // так соседние рассылки стыкуются без пропусков и пересечений
                    using var scope = _scopeFactory.CreateScope();
                    await scope.ServiceProvider.GetRequiredService<IDigestService>()
                        .SendDigestsAsync(nextRun, stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    return;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error while sending digests");
                }

                // Следующую рассылку считаем от этой, а не от текущего времени: если таймер сработал
                // на мгновение раньше, та же рассылка не уйдёт второй раз
                lastRun = nextRun;
            }
        }

        /// <summary> Ближайший момент рассылки (UTC) строго после <paramref name="utcNow"/> </summary>
        public static DateTime GetNextRun(DateTime utcNow, TimeSpan moscowSendTime)
        {
            var moscowNow = utcNow + NotificationHtml.MoscowOffset;
            var nextRun = moscowNow.Date + moscowSendTime;
            if (nextRun <= moscowNow) nextRun = nextRun.AddDays(1);
            return DateTime.SpecifyKind(nextRun - NotificationHtml.MoscowOffset, DateTimeKind.Utc);
        }
    }
}
