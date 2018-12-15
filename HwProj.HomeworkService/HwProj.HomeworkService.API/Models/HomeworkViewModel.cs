using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models
{
    public class CreateHomeworkViewModel
    {
        public string Name { get; set; }
    }

    public class HomeworkViewModel
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public List<HomeworkApplicationViewModel> Applications { get; set; } = new List<HomeworkApplicationViewModel>();

        public static HomeworkViewModel FromHomework(Homework homework, IMapper maper)
        {
            var result = maper.Map<HomeworkViewModel>(homework);
            result.Applications = homework.Applications.Select(a => maper.Map<HomeworkApplicationViewModel>(a)).ToList();

            return result;
        }
    }

    public class CreateHomeworkApplicationViewModel
    {
        public string Name { get; set; }
        public string Link { get; set; }
    }

    public class HomeworkApplicationViewModel
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string Link { get; set; }
    }
}
