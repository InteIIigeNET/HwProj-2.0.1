using System.Linq;
using System.Text;
using HwProj.NotificationsService.API.Services.Messages;
using static HwProj.NotificationsService.API.Services.Messages.EmailTemplate;

namespace HwProj.NotificationsService.API.Services.Digest
{
    /// <summary>
    /// Вёрстка письма-дайжеста. Шапка, карточка и подвал — общие с обычными письмами (<see cref="EmailTemplate"/>),
    /// внутри карточки — плитки с итогами дня и секции с событиями, сгруппированными по курсам
    /// </summary>
    public static class DigestTemplate
    {
        private const int MaxStats = 3;

        public static string RenderHtml(DigestMessage digest, string recipientName, string siteUrl, string logoSrc)
        {
            var html = new StringBuilder();

            AppendDocumentStart(html, digest.Subject, digest.Summary, siteUrl, logoSrc);

            AppendPill(html, digest.Label, Brand, "#e4e7f6");
            html.Append($"<span style=\"margin-left:8px;font-size:13px;color:{MutedColor};\">" +
                        $"{NotificationHtml.Encode(Date(digest))}</span>");
            AppendTitle(html, digest.Title);

            if (!string.IsNullOrWhiteSpace(recipientName)) AppendGreeting(html, recipientName);
            html.Append("<p style=\"margin:12px 0 0;\">Собрали в одном письме всё, что произошло в ваших курсах.</p>");

            AppendStats(html, digest);
            foreach (var section in digest.Sections) AppendSection(html, section);

            AppendButton(html, digest.ActionLabel, siteUrl);
            AppendNote(html, $"{Note(digest)} Все уведомления по-прежнему доступны в " +
                             $"{NotificationHtml.Link($"{siteUrl}/notifications", "ленте на сайте")}.");

            AppendDocumentEnd(html, siteUrl);
            return html.ToString();
        }

        /// <summary> Текстовая версия письма для клиентов без HTML и для спам-фильтров </summary>
        public static string RenderText(DigestMessage digest, string recipientName, string siteUrl)
        {
            var text = new StringBuilder();
            text.AppendLine($"{digest.Title} · {Date(digest)}").AppendLine();

            if (!string.IsNullOrWhiteSpace(recipientName))
                text.AppendLine($"Здравствуйте, {recipientName}!").AppendLine();

            text.AppendLine($"{digest.Summary}.").AppendLine();

            foreach (var section in digest.Sections)
            {
                text.AppendLine(section.Title.ToUpperInvariant());
                foreach (var group in section.Groups)
                {
                    if (group.Title != null) text.AppendLine($"{group.Title} — {group.Url}");
                    foreach (var entry in group.Entries)
                    {
                        text.AppendLine(string.IsNullOrEmpty(entry.Badge)
                            ? $"  • {entry.Title}"
                            : $"  • {entry.Title} — {entry.Badge}");
                        if (!string.IsNullOrEmpty(entry.Hint)) text.AppendLine($"    {entry.Hint}");
                        foreach (var (label, value) in entry.Criteria) text.AppendLine($"    {label} — {value}");
                        if (!string.IsNullOrEmpty(entry.Quote))
                            text.AppendLine($"    {entry.QuoteLabel}: {entry.Quote.Replace("\n", "\n    ")}");
                        text.AppendLine($"    {entry.Url}");
                    }

                    if (group.HiddenCount > 0) text.AppendLine($"  {group.HiddenLabel}");
                }

                text.AppendLine();
            }

            text.AppendLine($"{digest.ActionLabel}: {siteUrl}").AppendLine();
            text.AppendLine($"{Note(digest)} Все уведомления по-прежнему доступны в ленте на сайте: " +
                            $"{siteUrl}/notifications")
                .AppendLine();

            AppendTextFooter(text, siteUrl);
            return text.ToString();
        }

        // Запрошенную сводку можно получить в любой момент, поэтому в ней важно и время, а не только день
        private static string Date(DigestMessage digest) => digest.IsRequested
            ? NotificationHtml.Date(digest.Date)
            : NotificationHtml.Day(digest.Date);

        private static string Note(DigestMessage digest) => digest.IsRequested
            ? "Вы запросили эту сводку на сайте. Автоматически такое письмо приходит раз в день, " +
              "если в ваших курсах что-то произошло."
            : "Такое письмо приходит раз в день и только если в ваших курсах что-то произошло.";

        /// <summary> Плитки с главными числами дня: «12 новых решений», «3 заявки на курсы» </summary>
        private static void AppendStats(StringBuilder html, DigestMessage digest)
        {
            var stats = digest.Sections.Take(MaxStats).ToArray();
            var width = 100 / stats.Length;

            html.Append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" " +
                        "style=\"margin-top:20px;\"><tr>");
            for (var i = 0; i < stats.Length; i++)
            {
                var gap = i < stats.Length - 1 ? "padding-right:8px;" : "";
                html.Append($"<td width=\"{width}%\" style=\"{gap}vertical-align:top;\">");
                html.Append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" " +
                            $"style=\"background-color:{PanelBackground};border-radius:10px;border-collapse:separate;\"><tr>");
                html.Append($"<td style=\"padding:12px 14px;font-family:{FontFamily};\">");
                html.Append($"<div style=\"font-size:24px;line-height:1.2;font-weight:700;color:{Brand};\">{stats[i].Count}</div>");
                html.Append($"<div style=\"margin-top:2px;font-size:13px;line-height:1.35;color:{MutedColor};\">" +
                            $"{NotificationHtml.Encode(stats[i].CountLabel)}</div>");
                html.Append("</td></tr></table></td>");
            }

            html.Append("</tr></table>");
        }

        private static void AppendSection(StringBuilder html, DigestSection section)
        {
            html.Append("<p style=\"margin:28px 0 0;font-size:12px;font-weight:600;letter-spacing:0.06em;" +
                        $"text-transform:uppercase;color:{MutedColor};\">{NotificationHtml.Encode(section.Title)}</p>");

            foreach (var group in section.Groups)
            {
                if (group.Title != null)
                    html.Append($"<p style=\"margin:12px 0 0;font-size:15px;font-weight:700;\">" +
                                $"<a href=\"{NotificationHtml.Encode(group.Url)}\" style=\"color:{TextColor};text-decoration:none;\">" +
                                $"{NotificationHtml.Encode(group.Title)}</a></p>");

                html.Append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" " +
                            $"style=\"margin-top:8px;background-color:{PanelBackground};border-radius:10px;" +
                            "border-collapse:separate;\">");

                var isFirst = true;
                foreach (var entry in group.Entries)
                {
                    AppendEntry(html, entry, isFirst ? "" : $"border-top:1px solid {BorderColor};");
                    isFirst = false;
                }

                if (group.HiddenCount > 0)
                    html.Append($"<tr><td colspan=\"2\" style=\"padding:10px 16px;border-top:1px solid {BorderColor};" +
                                $"font-family:{FontFamily};font-size:13px;color:{MutedColor};\">" +
                                $"{NotificationHtml.Encode(group.HiddenLabel)}</td></tr>");

                html.Append("</table>");
            }
        }

        private static void AppendEntry(StringBuilder html, DigestEntry entry, string separator)
        {
            html.Append("<tr>");
            html.Append($"<td style=\"padding:12px 16px;{separator}font-family:{FontFamily};font-size:14px;" +
                        $"line-height:1.45;color:{TextColor};vertical-align:top;\">");
            html.Append($"<a href=\"{NotificationHtml.Encode(entry.Url)}\" style=\"color:{Brand};font-weight:600;" +
                        $"text-decoration:none;\">{NotificationHtml.Encode(entry.Title)}</a>");

            if (!string.IsNullOrEmpty(entry.Hint))
                html.Append($"<div style=\"margin-top:2px;font-size:13px;color:{MutedColor};\">" +
                            $"{NotificationHtml.Encode(entry.Hint)}</div>");

            if (entry.Criteria.Any()) AppendCriteria(html, entry);
            if (!string.IsNullOrEmpty(entry.Quote)) AppendQuote(html, entry);

            html.Append("</td>");

            html.Append($"<td align=\"right\" style=\"padding:12px 16px 12px 0;{separator}vertical-align:top;" +
                        "white-space:nowrap;\">");
            if (!string.IsNullOrEmpty(entry.Badge))
            {
                var tone = GetTone(entry.BadgeTone);
                AppendPill(html, entry.Badge, tone.Color, tone.Background);
            }

            html.Append("</td></tr>");
        }

        private static void AppendCriteria(StringBuilder html, DigestEntry entry)
        {
            html.Append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" " +
                        "style=\"margin-top:8px;\">");
            foreach (var (label, value) in entry.Criteria)
                html.Append("<tr>" +
                            $"<td style=\"padding:2px 12px 2px 0;font-size:13px;color:{MutedColor};\">" +
                            $"{NotificationHtml.Encode(label)}</td>" +
                            $"<td align=\"right\" style=\"padding:2px 0;font-size:13px;font-weight:600;white-space:nowrap;\">" +
                            $"{NotificationHtml.Encode(value)}</td>" +
                            "</tr>");
            html.Append("</table>");
        }

        private static void AppendQuote(StringBuilder html, DigestEntry entry)
        {
            var text = NotificationHtml.Encode(entry.Quote).Replace("\r\n", "\n").Replace("\n", "<br>");

            html.Append($"<div style=\"margin-top:8px;padding:8px 12px;border-left:3px solid {Brand};" +
                        "background-color:#ffffff;border-radius:0 8px 8px 0;font-size:13px;line-height:1.5;\">");
            html.Append("<div style=\"margin-bottom:2px;font-size:11px;font-weight:600;letter-spacing:0.06em;" +
                        $"text-transform:uppercase;color:{MutedColor};\">{NotificationHtml.Encode(entry.QuoteLabel)}</div>");
            html.Append(text);
            html.Append("</div>");
        }

        private static (string Color, string Background) GetTone(DigestTone tone)
        {
            switch (tone)
            {
                case DigestTone.Success: return ("#1f7a6b", "#e3f2ee");
                case DigestTone.Warning: return ("#8a5a00", "#fdf1d8");
                case DigestTone.Danger: return ("#b42318", "#fdecea");
                default: return (Brand, "#e4e7f6");
            }
        }
    }
}
