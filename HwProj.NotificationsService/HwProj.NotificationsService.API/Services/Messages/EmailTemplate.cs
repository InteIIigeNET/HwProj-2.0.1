using System.Collections.Generic;
using System.Linq;
using System.Text;
using HwProj.NotificationsService.API.Models;

namespace HwProj.NotificationsService.API.Services.Messages
{
    /// <summary>
    /// Вёрстка письма в стиле hwproj.ru: индиго-шапка с логотипом, белая карточка со скруглениями,
    /// мягкие плашки для деталей. Почтовые клиенты плохо понимают CSS, поэтому письмо собрано
    /// таблицами, а все стили — инлайновые
    /// </summary>
    public static class EmailTemplate
    {
        private const string Brand = "#3f51b5";
        private const string FontFamily = "Helvetica,Arial,sans-serif";
        private const string TextColor = "#2f3542";
        private const string MutedColor = "#6b7280";
        private const string PageBackground = "#eef0f5";
        private const string PanelBackground = "#f3f4fb";
        private const string BorderColor = "#e1e4ec";

        private const string LinkStyle = "color:" + Brand + ";font-weight:600;text-decoration:none;";

        // Цвета категорий совпадают с плашками категорий в ленте уведомлений на сайте
        private static (string Label, string Color, string Background) GetCategoryTone(CategoryState category)
        {
            switch (category)
            {
                case CategoryState.Profile: return ("Профиль", "#6b4fa8", "#f1ecfa");
                case CategoryState.Courses: return ("Курсы", Brand, "#e4e7f6");
                case CategoryState.Homeworks: return ("Задания", "#1f7a6b", "#e3f2ee");
                default: return ("Уведомление", "#5a6472", "#eef0f5");
            }
        }

        public static string RenderHtml(NotificationMessage message, string recipientName, string siteUrl,
            string logoSrc)
        {
            var tone = GetCategoryTone(message.Category);
            var html = new StringBuilder();

            html.Append("<!DOCTYPE html><html lang=\"ru\"><head>");
            html.Append("<meta charset=\"utf-8\">");
            html.Append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">");
            html.Append("<meta name=\"x-apple-disable-message-reformatting\">");
            html.Append("<meta name=\"color-scheme\" content=\"light\">");
            html.Append("<meta name=\"supported-color-schemes\" content=\"light\">");
            html.Append($"<title>{NotificationHtml.Encode(message.Subject)}</title>");
            html.Append("</head>");
            html.Append($"<body style=\"margin:0;padding:0;background-color:{PageBackground};\">");

            // Превью в списке писем: без него клиенты показывают первые слова вёрстки — «HwProj Задания …»
            html.Append("<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;\">");
            html.Append(NotificationHtml.Encode(NotificationHtml.ToPlainText(message.Text)));
            html.Append("</div>");

            html.Append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" " +
                        $"style=\"background-color:{PageBackground};\"><tr><td align=\"center\" style=\"padding:32px 12px;\">");
            html.Append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" " +
                        "style=\"max-width:600px;\">");

            AppendHeader(html, siteUrl, logoSrc);

            html.Append($"<tr><td style=\"background-color:#ffffff;border:1px solid {BorderColor};border-top:0;" +
                        $"border-radius:0 0 14px 14px;padding:28px 28px 24px;font-family:{FontFamily};" +
                        $"color:{TextColor};font-size:15px;line-height:1.55;\">");

            html.Append($"<span style=\"display:inline-block;padding:3px 10px;border-radius:999px;" +
                        $"background-color:{tone.Background};color:{tone.Color};font-size:12px;font-weight:600;" +
                        $"line-height:18px;\">{tone.Label}</span>");
            html.Append($"<h1 style=\"margin:14px 0 0;font-size:22px;line-height:1.3;font-weight:700;color:{TextColor};\">" +
                        $"{NotificationHtml.Encode(message.Title)}</h1>");

            if (!string.IsNullOrWhiteSpace(recipientName))
                html.Append($"<p style=\"margin:16px 0 0;\">Здравствуйте, {NotificationHtml.Encode(recipientName)}!</p>");

            if (!string.IsNullOrEmpty(message.Text))
                html.Append($"<p style=\"margin:12px 0 0;\">{StyleLinks(message.Text)}</p>");

            if (message.Details.Any()) AppendRows(html, null, message.Details.Select(d => (d.Label, d.Value)));

            if (message.Breakdown.Any())
                AppendRows(html, message.BreakdownTitle, message.Breakdown.Select(r =>
                    (r.Label, NotificationHtml.Encode(r.Value))));

            if (!string.IsNullOrEmpty(message.QuoteText)) AppendQuote(html, message);

            if (message.HasAction) AppendAction(html, message);

            if (!string.IsNullOrEmpty(message.Note))
                html.Append($"<p style=\"margin:24px 0 0;padding-top:16px;border-top:1px solid {BorderColor};" +
                            $"font-size:13px;color:{MutedColor};\">{StyleLinks(message.Note)}</p>");

            html.Append("</td></tr>");

            AppendFooter(html, siteUrl);

            html.Append("</table></td></tr></table></body></html>");
            return html.ToString();
        }

        /// <summary> Текстовая версия письма для клиентов без HTML и для спам-фильтров </summary>
        public static string RenderText(NotificationMessage message, string recipientName, string siteUrl)
        {
            var text = new StringBuilder();
            text.AppendLine(message.Title).AppendLine();

            if (!string.IsNullOrWhiteSpace(recipientName))
                text.AppendLine($"Здравствуйте, {recipientName}!").AppendLine();

            if (!string.IsNullOrEmpty(message.Text))
                text.AppendLine(NotificationHtml.ToPlainText(message.Text)).AppendLine();

            foreach (var (label, value) in message.Details)
                text.AppendLine($"{label}: {NotificationHtml.ToPlainText(value)}");
            if (message.Details.Any()) text.AppendLine();

            if (message.Breakdown.Any())
            {
                text.AppendLine($"{message.BreakdownTitle}:");
                foreach (var (label, value) in message.Breakdown) text.AppendLine($"  {label} — {value}");
                text.AppendLine();
            }

            if (!string.IsNullOrEmpty(message.QuoteText))
                text.AppendLine($"{message.QuoteLabel}:").AppendLine(message.QuoteText).AppendLine();

            if (message.HasAction)
            {
                if (!string.IsNullOrEmpty(message.ActionHint))
                    text.AppendLine(NotificationHtml.ToPlainText(message.ActionHint));
                text.AppendLine($"{message.ActionLabel}: {message.ActionUrl}").AppendLine();
            }

            if (!string.IsNullOrEmpty(message.Note))
                text.AppendLine(NotificationHtml.ToPlainText(message.Note)).AppendLine();

            text.AppendLine("—").AppendLine($"HwProj · {siteUrl}");
            return text.ToString();
        }

        private static void AppendHeader(StringBuilder html, string siteUrl, string logoSrc)
        {
            html.Append($"<tr><td style=\"background-color:{Brand};border-radius:14px 14px 0 0;padding:12px 24px;\">");
            html.Append($"<a href=\"{NotificationHtml.Encode(siteUrl)}\" style=\"text-decoration:none;color:#ffffff;\">");
            html.Append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>");
            html.Append("<td style=\"vertical-align:middle;\">" +
                        $"<img src=\"{logoSrc}\" width=\"51\" height=\"40\" alt=\"\" " +
                        "style=\"display:block;border:0;outline:none;\"></td>");
            html.Append($"<td style=\"vertical-align:middle;padding-left:8px;font-family:{FontFamily};font-size:22px;" +
                        "font-weight:700;letter-spacing:0.2px;color:#ffffff;\">HwProj</td>");
            html.Append("</tr></table></a></td></tr>");
        }

        private static void AppendRows(StringBuilder html, string title,
            IEnumerable<(string Label, string Value)> rows)
        {
            if (!string.IsNullOrEmpty(title))
                html.Append($"<p style=\"margin:24px 0 0;font-size:12px;font-weight:600;letter-spacing:0.06em;" +
                            $"text-transform:uppercase;color:{MutedColor};\">{NotificationHtml.Encode(title)}</p>");

            html.Append($"<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" " +
                        $"style=\"margin-top:{(string.IsNullOrEmpty(title) ? 20 : 8)}px;background-color:{PanelBackground};" +
                        "border-radius:10px;border-collapse:separate;\">");

            var isFirst = true;
            foreach (var (label, value) in rows)
            {
                var separator = isFirst ? "" : $"border-top:1px solid {BorderColor};";
                html.Append("<tr>");
                html.Append($"<td style=\"padding:10px 16px;{separator}font-family:{FontFamily};font-size:14px;" +
                            $"color:{MutedColor};vertical-align:top;width:40%;\">{NotificationHtml.Encode(label)}</td>");
                html.Append($"<td style=\"padding:10px 16px;{separator}font-family:{FontFamily};font-size:14px;" +
                            $"color:{TextColor};font-weight:600;vertical-align:top;\">{StyleLinks(value)}</td>");
                html.Append("</tr>");
                isFirst = false;
            }

            html.Append("</table>");
        }

        private static void AppendQuote(StringBuilder html, NotificationMessage message)
        {
            var text = NotificationHtml.Encode(message.QuoteText).Replace("\r\n", "\n").Replace("\n", "<br>");

            html.Append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" " +
                        "style=\"margin-top:20px;\"><tr>");
            html.Append($"<td style=\"padding:12px 16px;border-left:3px solid {Brand};background-color:{PanelBackground};" +
                        $"border-radius:0 10px 10px 0;font-family:{FontFamily};font-size:14px;line-height:1.55;color:{TextColor};\">");
            html.Append($"<div style=\"margin-bottom:4px;font-size:12px;font-weight:600;letter-spacing:0.06em;" +
                        $"text-transform:uppercase;color:{MutedColor};\">{NotificationHtml.Encode(message.QuoteLabel)}</div>");
            html.Append(text);
            html.Append("</td></tr></table>");
        }

        private static void AppendAction(StringBuilder html, NotificationMessage message)
        {
            var url = NotificationHtml.Encode(message.ActionUrl);

            if (!string.IsNullOrEmpty(message.ActionHint))
                html.Append($"<p style=\"margin:12px 0 0;\">{StyleLinks(message.ActionHint)}</p>");

            // «Пуленепробиваемая» кнопка: ячейка с заливкой и ссылка внутри — так кнопку рисует даже Outlook
            html.Append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" " +
                        "style=\"margin-top:24px;\"><tr>");
            html.Append($"<td align=\"center\" bgcolor=\"{Brand}\" style=\"border-radius:10px;background-color:{Brand};\">");
            html.Append($"<a href=\"{url}\" target=\"_blank\" style=\"display:inline-block;padding:12px 24px;" +
                        $"font-family:{FontFamily};font-size:15px;font-weight:600;line-height:20px;color:#ffffff;" +
                        $"text-decoration:none;border-radius:10px;\">{NotificationHtml.Encode(message.ActionLabel)}</a>");
            html.Append("</td></tr></table>");

            if (message.ShowActionUrl)
                html.Append($"<p style=\"margin:16px 0 0;font-size:13px;color:{MutedColor};\">" +
                            "Если кнопка не работает, скопируйте ссылку в адресную строку браузера:<br>" +
                            $"<a href=\"{url}\" style=\"color:{Brand};text-decoration:none;word-break:break-all;\">{url}</a></p>");
        }

        private static void AppendFooter(StringBuilder html, string siteUrl)
        {
            html.Append($"<tr><td align=\"center\" style=\"padding:20px 16px 0;font-family:{FontFamily};" +
                        $"font-size:12px;line-height:1.6;color:#8b929f;\">");
            html.Append("Это автоматическое письмо, отвечать на него не нужно.<br>");
            html.Append($"<a href=\"{NotificationHtml.Encode(siteUrl)}\" style=\"color:#8b929f;text-decoration:underline;\">" +
                        "HwProj</a> — сервис для сдачи и проверки домашних заданий");
            html.Append("</td></tr>");
        }

        /// <summary>
        /// Ссылки в тексте собираются через <see cref="NotificationHtml"/> без стилей — в ленте их оформляет сайт.
        /// В письме стили должны быть инлайновыми, поэтому дописываем их здесь. Пользовательский текст
        /// экранирован, так что все теги &lt;a&gt; в нём — наши
        /// </summary>
        private static string StyleLinks(string html) =>
            (html ?? "").Replace("<a href=", $"<a style=\"{LinkStyle}\" href=");
    }
}
