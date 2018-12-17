using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.TasksService.API.Models
{
    public class Homework
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long Id { get; set; }

        public List<HomeworkTask> Tasks { get; set; } = new List<HomeworkTask>();
    }
}
