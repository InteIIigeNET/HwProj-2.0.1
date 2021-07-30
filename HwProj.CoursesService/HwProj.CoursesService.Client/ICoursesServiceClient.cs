using System.Threading.Tasks;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.Client
{
    public interface ICoursesServiceClient
    {
        Task<CourseViewModel[]> GetAllCourses();

        Task<CourseViewModel> GetCourseData(long courseId);
        
        Task DeleteCourse(long courseId);

        Task<long> CreateCourse(CreateCourseViewModel model, string mentorId);

        Task UpdateCourse(CourseViewModel model, long courseId);

        Task SignInCourse(long courseId, string studentId);

        Task AcceptStudent(long courseId, string studentId);

        Task RejectStudent(long courseId, string studentId);

        Task<CourseViewModel[]> GetAllUserCourses(string userId);
    }
}
