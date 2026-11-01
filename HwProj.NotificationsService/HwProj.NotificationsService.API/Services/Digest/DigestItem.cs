using System;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Unicode;
using HwProj.NotificationsService.API.Models;

namespace HwProj.NotificationsService.API.Services.Digest
{
    /// <summary>
    /// Событие для письма-дайжеста. Хранится в уведомлении: тип — в <see cref="Notification.DigestKind"/>,
    /// остальные данные — JSON в <see cref="Notification.DigestData"/>
    /// </summary>
    public class DigestItem
    {
        private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            // Без этого кириллица в названиях курсов и комментариях хранилась бы как \uXXXX
            Encoder = JavaScriptEncoder.Create(UnicodeRanges.All)
        };

        [JsonIgnore] public DigestItemKind Kind { get; set; }
        [JsonIgnore] public DateTime Date { get; set; }

        public long CourseId { get; set; }
        public string CourseName { get; set; }

        public long? HomeworkId { get; set; }
        public string HomeworkTitle { get; set; }

        public long? TaskId { get; set; }
        public string TaskTitle { get; set; }

        /// <summary> Студент, который отправил решение, подал заявку на курс или задал вопрос </summary>
        public string StudentId { get; set; }

        public string StudentName { get; set; }

        public int? Rating { get; set; }
        public int? MaxRating { get; set; }

        /// <summary> Оценка до исправления; null, если решение проверено впервые </summary>
        public int? PreviousRating { get; set; }

        public string Question { get; set; }
        public string Answer { get; set; }

        /// <summary> Комментарий преподавателя к оценке как есть, вместе с таблицей критериев </summary>
        public string Comment { get; set; }

        public DateTime? DeadlineDate { get; set; }

        public string Serialize() => JsonSerializer.Serialize(this, JsonOptions);

        public static DigestItem FromNotification(Notification notification)
        {
            var item = string.IsNullOrEmpty(notification.DigestData)
                ? new DigestItem()
                : JsonSerializer.Deserialize<DigestItem>(notification.DigestData, JsonOptions);
            item.Kind = notification.DigestKind ?? default;
            item.Date = notification.Date;
            return item;
        }

        /// <summary> Уведомление, которое нужно только для дайжеста: в ленте его не видно </summary>
        public Notification ToDigestOnlyNotification(string owner, string sender, CategoryState category) =>
            new Notification
            {
                Owner = owner,
                Sender = sender,
                Category = category,
                Date = DateTime.UtcNow,
                IsDigestOnly = true,
                DigestKind = Kind,
                DigestData = Serialize()
            };
    }
}
