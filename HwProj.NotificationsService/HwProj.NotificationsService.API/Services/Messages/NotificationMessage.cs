using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using HwProj.NotificationsService.API.Models;

namespace HwProj.NotificationsService.API.Services.Messages
{
    /// <summary>
    /// Содержимое уведомления, из которого собираются и запись в ленте уведомлений, и письмо.
    /// Текстовые поля (Text, значения деталей, Hint) — уже готовый HTML: собирайте их через <see cref="NotificationHtml"/>
    /// </summary>
    public class NotificationMessage
    {
        public NotificationMessage(CategoryState category, string title)
        {
            Category = category;
            Title = title;
            Subject = title;
        }

        public CategoryState Category { get; }

        /// <summary> Короткий заголовок: «Новая задача», «Решение оценено» </summary>
        public string Title { get; }

        /// <summary> Тема письма без префикса HwProj — его добавляет <see cref="EmailService"/> </summary>
        public string Subject { get; private set; }

        /// <summary> Основное предложение уведомления </summary>
        public string Text { get; private set; } = "";

        /// <summary> Ключевые факты события: курс, дедлайн, оценка </summary>
        public List<(string Label, string Value)> Details { get; } = new List<(string Label, string Value)>();

        public string BreakdownTitle { get; private set; }
        public List<(string Label, string Value)> Breakdown { get; } = new List<(string Label, string Value)>();

        public string QuoteLabel { get; private set; }

        /// <summary> Цитата хранится обычным текстом: это комментарий пользователя, его экранируют при рендере </summary>
        public string QuoteText { get; private set; }

        public string ActionLabel { get; private set; }
        public string ActionUrl { get; private set; }

        /// <summary> Пояснение перед кнопкой, только для письма: в ленте кнопки нет </summary>
        public string ActionHint { get; private set; }

        /// <summary> Показывать ли под кнопкой адрес ссылки — для писем со ссылками подтверждения </summary>
        public bool ShowActionUrl { get; private set; }

        /// <summary> Приписка мелким текстом в конце письма </summary>
        public string Note { get; private set; }

        public bool HasAction => !string.IsNullOrEmpty(ActionUrl);

        public NotificationMessage WithSubject(string subject)
        {
            Subject = subject;
            return this;
        }

        public NotificationMessage WithText(string html)
        {
            Text = html;
            return this;
        }

        public NotificationMessage WithDetail(string label, string html)
        {
            Details.Add((label, html));
            return this;
        }

        public NotificationMessage WithBreakdown(string title, IEnumerable<(string Label, string Value)> rows)
        {
            BreakdownTitle = title;
            Breakdown.AddRange(rows);
            return this;
        }

        public NotificationMessage WithQuote(string label, string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return this;
            QuoteLabel = label;
            QuoteText = text.Trim();
            return this;
        }

        public NotificationMessage WithAction(string label, string url, string hint = null, bool showUrl = false)
        {
            ActionLabel = label;
            ActionUrl = url;
            ActionHint = hint;
            ShowActionUrl = showUrl;
            return this;
        }

        public NotificationMessage WithNote(string html)
        {
            Note = html;
            return this;
        }

        public Notification ToNotification(string owner, string sender, DateTime? date = null) =>
            new Notification
            {
                Sender = sender,
                Body = ToInAppHtml(),
                Category = Category,
                Date = date ?? DateTime.UtcNow,
                HasSeen = false,
                Owner = owner
            };

        /// <summary>
        /// HTML для ленты уведомлений. Лента сама рисует иконку категории и время, а текст выводит
        /// с white-space: pre-line — поэтому разметка собирается в одну строку без лишних переносов
        /// </summary>
        public string ToInAppHtml()
        {
            var html = new StringBuilder();
            html.Append($"<b>{NotificationHtml.Encode(Title)}</b>");
            if (!string.IsNullOrEmpty(Text)) html.Append("<br/>").Append(Text);

            if (Details.Any()) html.Append(InAppMetaLine(Details.Select(d => $"{NotificationHtml.Encode(d.Label)}: {d.Value}")));

            if (Breakdown.Any())
                html.Append(InAppMetaLine(Breakdown.Select(r =>
                    $"{NotificationHtml.Encode(r.Label)} — {NotificationHtml.Encode(r.Value)}")));

            if (!string.IsNullOrEmpty(QuoteText))
            {
                html.Append("<div style=\"margin-top:8px;padding:6px 10px;border-left:3px solid #c5cae9;" +
                            "background-color:#f3f4fb;border-radius:0 8px 8px 0;color:#4b5563\">");
                html.Append("<span style=\"display:block;font-size:0.75em;font-weight:600;letter-spacing:0.04em;" +
                            $"text-transform:uppercase;color:#6b7280\">{NotificationHtml.Encode(QuoteLabel)}</span>");
                html.Append(NotificationHtml.Encode(QuoteText));
                html.Append("</div>");
            }

            return html.ToString();
        }

        private static string InAppMetaLine(IEnumerable<string> items) =>
            "<br/><span style=\"color:#6b7280;font-size:0.875em\">" + string.Join(" · ", items) + "</span>";
    }
}
