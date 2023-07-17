using HwProj.EventBus.Client;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;

namespace HwProj.SolutionsService.API.Events
{
    public class StudentPassTaskEvent : Event
    {
        public long CourseId { get; set; }
        public string CourseName { get; set; }
        public SolutionViewModel Solution { get; set; }
        public AccountDataDto Student { get; set; }
        public HomeworkTaskViewModel Task { get; set; }
        public string[] MentorIds { get; set; }

        public StudentPassTaskEvent(long courseId, string courseName, SolutionViewModel solution, AccountDataDto student, HomeworkTaskViewModel task, string[] mentorIds)
        {
            Solution = solution;
            CourseName = courseName;
            Student= student;
            Task = task;
            MentorIds = mentorIds;
        }
    }
}
