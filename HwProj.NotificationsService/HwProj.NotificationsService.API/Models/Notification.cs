using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.NotificationsService.API.Models
{
    public class Notification : IEntity
    {
        [Key]
        public long Id { get; set; }
        public string From { get; set; }
        //навесить индекс
        public string Owner { get; set; }
        public string Category { get; set; }
        public string Body { get; set; }
    }
}