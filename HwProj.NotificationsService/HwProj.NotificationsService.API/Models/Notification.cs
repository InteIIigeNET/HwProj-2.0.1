using System;
using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HwProj.NotificationsService.API.Models
{
    public class Notification : IEntity
    {
        [Key]
        public long Id { get; set; }
        public string Sender { get; set; }
        public string Owner { get; set; }
        public string Category { get; set; }
        public string Body { get; set; }
        public bool HasSeen { get; set; }
        public DateTime Date { get; set; }
    }
}