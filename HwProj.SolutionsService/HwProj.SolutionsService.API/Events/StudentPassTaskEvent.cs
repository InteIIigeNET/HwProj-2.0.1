using HwProj.EventBus.Client;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;

namespace HwProj.SolutionsService.API.Events
{
    public class StudentPassTaskEvent : Event
    {
        public CourseDTO Course { get; set; }
        public SolutionViewModel Solution { get; set; }
        public AccountDataDto Student { get; set; }
        public HomeworkTaskViewModel Task { get; set; }

        public StudentPassTaskEvent(CourseDTO course, SolutionViewModel solution, AccountDataDto student, HomeworkTaskViewModel task)
        {
            Course = course;
            Solution = solution;
            Student= student;
            Task = task;
        }
    }
}
