using System;
using System.ComponentModel.DataAnnotations;
using HwProj.Repositories.Net8;

namespace HwProj.NotificationsService.API.Models
{
    public class Notification : IEntity<long>
    {
        [Key] public long Id { get; set; }

        public string Sender { get; set; }

        //навесить индекс
        public string Owner { get; set; }
        public CategoryState Category { get; set; }
        public string Body { get; set; }
        public bool HasSeen { get; set; }
        //TODO: выставлять автоматически
        public DateTime Date { get ; set; }

        /// <summary> Тип события для письма-дайжеста; null — уведомление в дайжест не попадает </summary>
        public DigestItemKind? DigestKind { get; set; }

        /// <summary>
        /// Данные события для дайжеста в JSON (курс, задача, оценка, комментарий): по ним дайжест группирует
        /// события, а <see cref="Body"/> — уже готовая вёрстка для ленты
        /// </summary>
        public string DigestData { get; set; }

        /// <summary> Уведомление нужно только для дайжеста и в ленте не показывается </summary>
        public bool IsDigestOnly { get; set; }
    }
}
