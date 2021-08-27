using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;

namespace HwProj.SolutionsService.API.Events
{
    public class StudentPassTaskEvent : Event
    {
        public CourseViewModel Course { get; set; }
        public SolutionViewModel Solution { get; set; }

        public StudentPassTaskEvent(CourseViewModel course, SolutionViewModel solution)
        {
            Course = course;
            Solution = solution;
        }
    }
}
