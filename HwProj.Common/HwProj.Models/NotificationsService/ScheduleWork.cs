using System;
using System.ComponentModel.DataAnnotations;
using HwProj.Repositories;

namespace HwProj.Models.NotificationsService
{
    public class ScheduleWork : IEntity<long>
    {
        [Key] 
        public long Id { get; set; }
        
        [Key]
        public Type Type { get; set; }

        public string JobId { get; set; }
    }
}