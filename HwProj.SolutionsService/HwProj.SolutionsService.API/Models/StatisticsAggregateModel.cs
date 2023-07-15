using System.Collections.Generic;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;

namespace HwProj.SolutionsService.API.Models
{
    public class StatisticsAggregateModel
    {
        public IEnumerable<CourseMateViewModel> CourseMates { get; set; }
        public List<HomeworkViewModel> Homeworks { get; set; }
        public List<Solution> Solutions { get; set; }
        public GroupViewModel[] Groups { get; set; }
    }
}
