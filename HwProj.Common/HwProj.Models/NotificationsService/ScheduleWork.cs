using System;
using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.Models.NotificationsService
{
    public class ScheduleWork : IEntity<long>
    {
        [Key] public long Id { get; set; }

        public long ScheduleWorkId { get; set; }

        public string JobId { get; set; }

        public Type ScheduleWorkType { get; set; }
    }
}