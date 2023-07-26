using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models.AuthService.DTO;

namespace HwProj.CoursesService.API.Services
{
    public interface ICoursesService
    {
        Task<Course[]> GetAllAsync();
        Task<Course?> GetAsync(long id);
        Task<Course?> GetByTaskAsync(long taskId);
        Task<long> AddAsync(Course course, string mentorId);
        Task DeleteAsync(long id);
        Task UpdateAsync(long courseId, Course updated);
        Task<bool> AddStudentAsync(long courseId, string studentId);
        Task<bool> AcceptCourseMateAsync(long courseId, string studentId);
        Task<bool> RejectCourseMateAsync(long courseId, string studentId);
        Task<Course[]> GetUserCoursesAsync(string userId);
        Task AcceptLecturerAsync(long courseId, string lecturerEmail);
        Task<AccountDataDto[]> GetLecturersAvailableForCourse(long courseId, string mentorId);
        Task<string[]> GetCourseLecturers(long courseId);
    }
}
