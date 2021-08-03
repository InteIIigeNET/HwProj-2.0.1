using System.Threading.Tasks;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.Client
{
    public interface ICoursesServiceClient
    {
        Task<CourseViewModel[]> GetAllCourses();

        Task<CourseViewModel> GetCourseById(long courseId);
        
        Task DeleteCourse(long courseId);

        Task<long> CreateCourse(CreateCourseViewModel model, string mentorId);

        Task UpdateCourse(UpdateCourseViewModel model, long courseId);

        Task SignInCourse(long courseId, string studentId);

        Task AcceptStudent(long courseId, string studentId);

        Task RejectStudent(long courseId, string studentId);

        Task<UserCourseDescription[]> GetAllUserCourses(string userId);

        Task<long> AddHomeworkToCourse(CreateHomeworkViewModel model, long courseId);

        Task UpdateHomework(CreateHomeworkViewModel model, long courseId, long homeworkId);

        Task DeleteHomework(long courseId, long homeworkId);

        Task<long> AddTask(long courseId, long homeworkId, CreateTaskViewModel taskViewModel);

        Task UpdateTask(long courseId, long homeworkId, long taskId, CreateTaskViewModel taskViewModel);
    }
}
