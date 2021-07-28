using System.Threading.Tasks;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.Client
{
    public interface ICoursesServiceClient
    {
        Task<CourseViewModel[]> GetAllCourses();

        Task<CourseViewModel> GetCourseData(long courseId);
        
        Task<CourseViewModel> DeleteCourse(long courseId);

        Task<long> CreateCourse(CreateCourseViewModel model, string mentorId);
    }
}
