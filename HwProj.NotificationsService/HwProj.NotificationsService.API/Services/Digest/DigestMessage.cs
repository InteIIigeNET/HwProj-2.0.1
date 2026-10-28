using System;
using System.Collections.Generic;
using System.Linq;
using HwProj.NotificationsService.API.Services.Messages;

namespace HwProj.NotificationsService.API.Services.Digest
{
    /// <summary>
    /// Содержимое письма-дайжеста: секции по типам событий, внутри — группы по курсам.
    /// Все строки — обычный текст, экранирует их <see cref="DigestTemplate"/>
    /// </summary>
    public class DigestMessage
    {
        private const int MaxSectionsInSubject = 3;

        /// <param name="date">Конец суток, за которые собрана сводка</param>
        public DigestMessage(DateTime date)
        {
            Date = date;
        }

        public DateTime Date { get; }

        public List<DigestSection> Sections { get; } = new List<DigestSection>();

        public string ActionLabel { get; set; } = "Открыть HwProj";

        /// <summary> Сводку запросил сам пользователь с сайта, а не ежедневная рассылка </summary>
        public bool IsRequested { get; set; }

        public string Label => IsRequested ? "Сводка" : "Итоги дня";

        public string Title => "Что нового за сутки";

        /// <summary> «12 новых решений, 3 заявки на курсы» </summary>
        public string Summary => string.Join(", ", Sections.Select(s => s.Summary));

        public string Subject => $"{Label}: " +
                                 string.Join(", ", Sections.Take(MaxSectionsInSubject).Select(s => s.Summary));
    }

    public class DigestSection
    {
        private readonly (string One, string Few, string Many) _countForms;

        /// <param name="countForms">Подпись к числу событий в трёх формах: «новое решение», «новых решения», «новых решений»</param>
        public DigestSection(string title, (string One, string Few, string Many) countForms)
        {
            Title = title;
            _countForms = countForms;
        }

        public string Title { get; }
        public List<DigestGroup> Groups { get; } = new List<DigestGroup>();

        /// <summary> Сколько событий в секции. Если не задано — по числу записей </summary>
        public int? ExplicitCount { get; set; }

        public int Count => ExplicitCount ?? Groups.Sum(g => g.Entries.Count + g.HiddenCount);

        public string CountLabel => NotificationHtml.Plural(Count, _countForms.One, _countForms.Few, _countForms.Many);

        public string Summary => $"{Count} {CountLabel}";
    }

    /// <summary> Записи одного курса. Если у группы нет заголовка, записи выводятся сразу под заголовком секции </summary>
    public class DigestGroup
    {
        public DigestGroup(string title = null, string url = null)
        {
            Title = title;
            Url = url;
        }

        public string Title { get; }
        public string Url { get; }
        public List<DigestEntry> Entries { get; } = new List<DigestEntry>();

        /// <summary> Сколько записей не поместилось в письмо </summary>
        public int HiddenCount { get; set; }

        /// <summary> Подпись для скрытых записей: «и ещё 4 задачи» </summary>
        public string HiddenLabel { get; set; }
    }

    public enum DigestTone
    {
        Neutral,
        Success,
        Warning,
        Danger
    }

    public class DigestEntry
    {
        public DigestEntry(string title, string url)
        {
            Title = title;
            Url = url;
        }

        public string Title { get; }
        public string Url { get; }

        /// <summary> Плашка справа: «5 решений», «8 / 10» </summary>
        public string Badge { get; set; }

        public DigestTone BadgeTone { get; set; }

        /// <summary> Пояснение мелким текстом под заголовком </summary>
        public string Hint { get; set; }

        public List<(string Label, string Value)> Criteria { get; } = new List<(string Label, string Value)>();

        public string QuoteLabel { get; set; }
        public string Quote { get; set; }
    }
}
