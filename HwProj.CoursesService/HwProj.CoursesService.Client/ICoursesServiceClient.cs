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

        Task UpdateCourse(CourseViewModel model, long courseId);

        Task SignInCourse(long courseId, string studentId);

        Task AcceptStudent(long courseId, string studentId);

        Task RejectStudent(long courseId, string studentId);

        Task<UserCourseDescription[]> GetAllUserCourses(string userId);

        Task<long> AddHomeworkToCourse(CreateHomeworkViewModel model, long courseId);

        Task UpdateHomework(CreateHomeworkViewModel model, long homeworkId);

        Task DeleteHomework(long homeworkId);
    }
}
