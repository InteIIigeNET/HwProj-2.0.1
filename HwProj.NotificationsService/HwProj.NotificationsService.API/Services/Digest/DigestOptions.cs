using System;

namespace HwProj.NotificationsService.API.Services.Digest
{
    /// <summary> Секция «Digest» в appsettings.json </summary>
    public class DigestOptions
    {
        /// <summary> Во сколько по Москве начинать рассылку </summary>
        public TimeSpan SendTime { get; set; } = new TimeSpan(20, 0, 0);

        /// <summary>
        /// Сколько писем отправлять за одно подключение к SMTP-серверу. Почтовые сервисы ограничивают
        /// частоту отправки и блокируют ящики, которые рассылают много писем разом, поэтому рассылка идёт пачками
        /// </summary>
        public int BatchSize { get; set; } = 20;

        /// <summary> Пауза между пачками писем </summary>
        public TimeSpan BatchDelay { get; set; } = TimeSpan.FromMinutes(1);

        /// <summary> Как часто пользователь может запросить сводку с сайта </summary>
        public TimeSpan RequestCooldown { get; set; } = TimeSpan.FromMinutes(5);
    }
}
