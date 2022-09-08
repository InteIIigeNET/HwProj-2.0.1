using System.Collections.Generic;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;

namespace HwProj.SolutionsService.API.Models
{
    public class StatisticsAggregateModel
    {
        public CourseDTO Course { get; set; }
        public List<Solution> Solutions { get; set; }
        public Dictionary<string, AccountDataDto> CourseMatesData { get; set; }
    }
}
