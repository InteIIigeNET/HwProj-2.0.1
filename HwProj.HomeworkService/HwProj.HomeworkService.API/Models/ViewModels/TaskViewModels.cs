using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models.ViewModels
{
    public class TaskViewModel
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
    }

    public class CreateTaskViewModel
    {
        public string Title { get; set; }
        public string Description { get; set; }
    }
}
