﻿using System;
using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.Models.NotificationsService
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
        public DateTime Date { get ; set; }
    }
}
