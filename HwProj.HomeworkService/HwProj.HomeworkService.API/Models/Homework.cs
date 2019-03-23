using System;
using System.Collections.Generic;
using HwProj.Repositories;

namespace HwProj.HomeworkService.API.Models
{
    public class Homework : IEntity
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        
        public List<HomeworkTask> Tasks { get; set; }
    }
}