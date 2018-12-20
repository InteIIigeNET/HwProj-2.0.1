using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.HomeworkService.API.Models.ViewModels
{
    public class CreateHomeworkViewModel
    {
        public string Title { get; set; }
    }

    public class HomeworkViewModel
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public List<HomeworkApplicationViewModel> Applications { get; set; } = new List<HomeworkApplicationViewModel>();
        public List<TaskViewModel> Tasks { get; set; } = new List<TaskViewModel>();

        public static HomeworkViewModel FromHomework(Homework homework, IMapper maper)
        {
            var result = maper.Map<HomeworkViewModel>(homework);
            result.Applications = homework.Applications.Select(a => maper.Map<HomeworkApplicationViewModel>(a)).ToList();
            result.Tasks = homework.Tasks.Select(maper.Map<TaskViewModel>).ToList();

            return result;
        }
    }
}
