using System.Collections.Generic;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;

namespace HwProj.SolutionsService.API.Models
{
    public class StatisticsAggregateModel
    {
        public IEnumerable<CourseMateViewModel> CourseMates { get; set; }
        public HomeworkViewModel[] Homeworks { get; set; }
        public List<Solution> Solutions { get; set; }
    }
}
