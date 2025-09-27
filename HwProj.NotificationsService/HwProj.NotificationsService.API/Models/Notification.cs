using System;
using System.ComponentModel.DataAnnotations;
using HwProj.Models.NotificationsService;
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
    }
}
