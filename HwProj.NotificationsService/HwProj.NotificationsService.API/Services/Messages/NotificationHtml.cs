using System;
using System.Globalization;
using System.Net;
using System.Text.RegularExpressions;

namespace HwProj.NotificationsService.API.Services.Messages
{
    /// <summary>
    /// Помощники для сборки текста уведомлений. Всё, что пришло от пользователей (названия курсов и задач,
    /// имена, комментарии), экранируется: текст уведомления рендерится как HTML и в ленте, и в письме
    /// </summary>
    public static class NotificationHtml
    {
        private static readonly CultureInfo RussianCulture = CultureInfo.GetCultureInfo("ru-RU");
        private static readonly Regex TagRegex = new Regex("<[^>]+>", RegexOptions.Compiled);
        private static readonly Regex SpacesRegex = new Regex(@"[ \t]+", RegexOptions.Compiled);

        public static string Encode(string text) => WebUtility.HtmlEncode(text ?? "");

        public static string Bold(string text) => $"<b>{Encode(text)}</b>";

        public static string Link(string url, string text) =>
            $"<a href=\"{Encode(url)}\">{Encode(text)}</a>";

        /// <summary>
        /// Ссылка на внешний ресурс (например, на репозиторий с решением): открывается в новой вкладке.
        /// Адрес приходит от пользователя, поэтому ссылкой становятся только http(s)-адреса
        /// </summary>
        public static string ExternalLink(string url, string text) =>
            IsWebUrl(url)
                ? $"<a href=\"{Encode(url)}\" target=\"_blank\" rel=\"noopener noreferrer\">{Encode(text)}</a>"
                : Encode(text);

        public static bool IsWebUrl(string url) =>
            Uri.TryCreate(url, UriKind.Absolute, out var uri) &&
            (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);

        /// <summary>
        /// Даты в сервисах хранятся в UTC, а студентам и преподавателям привычнее московское время
        /// </summary>
        public static string Date(DateTime utcDate) =>
            utcDate.AddHours(3).ToString("d MMMM yyyy, HH:mm", RussianCulture) + " (МСК)";

        public static string FullName(string name, string surname) =>
            string.Join(" ", new[] { name, surname }).Trim();

        public static string ToPlainText(string html)
        {
            var text = (html ?? "")
                .Replace("<br/>", "\n")
                .Replace("<br>", "\n");
            text = WebUtility.HtmlDecode(TagRegex.Replace(text, ""));
            return SpacesRegex.Replace(text, " ").Trim();
        }
    }
}
