using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models.ViewModels
{
    public class CreateHomeworkApplicationViewModel
    {
        public string Title { get; set; }
        public string Link { get; set; }
    }

    public class HomeworkApplicationViewModel
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string Link { get; set; }
    }
}
