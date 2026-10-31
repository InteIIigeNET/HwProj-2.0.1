using System.Threading.Tasks;
using HwProj.CoursesService.API.Domains;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Services
{
    public interface ICoursesService
    {
        Task<Course[]> GetAllAsync();
        /// <summary>
        /// Курс со всеми данными. Если указан userId, применяются его фильтры курса
        /// </summary>
        Task<CourseDTO?> GetAsync(long id, string userId = "", bool asView = false);

        /// <summary>
        /// Курс глазами пользователя: с его фильтрами курса и только с теми данными, которые ему доступны
        /// </summary>
        Task<CourseDTO?> GetForUserAsync(long id, string userId, bool asView = false);

        Task<CourseAccess?> GetCourseAccessAsync(long courseId, string userId);
        Task<CourseDTO?> GetForEditingAsync(long id);
        Task<CourseDTO?> GetByTaskAsync(long taskId, string userId);
        Task<long> AddAsync(CreateCourseViewModel courseViewModel, string mentorId);
        Task DeleteAsync(long id);
        Task UpdateAsync(long courseId, Course updated);
        Task<bool> AddStudentAsync(long courseId, string studentId);
        Task<bool> AcceptCourseMateAsync(long courseId, string studentId);
        Task<bool> RejectCourseMateAsync(long courseId, string studentId);
        Task<CourseDTO[]> GetUserCoursesAsync(string userId, string role);
        Task<bool> AcceptLecturerAsync(long courseId, string lecturerEmail, string lecturerId);
        Task<string[]> GetCourseLecturers(long courseId);
        Task<bool> HasStudent(long courseId, string studentId);
        Task<bool> UpdateStudentCharacteristics(long courseId, string studentId, StudentCharacteristicsDto characteristics);
    }
}
