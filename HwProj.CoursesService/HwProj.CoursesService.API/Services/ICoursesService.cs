using System;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Services
{
    public interface ICoursesService
    {
        Task<CourseDTO?> GetAsync(long id, string userId = "");
        Task<CourseDTO?> GetByTaskAsync(long taskId, string userId);
        Task<long> AddAsync(Course course, string mentorId);
        Task DeleteAsync(long id);
        Task UpdateAsync(long courseId, Course updated);
        Task<bool> AddStudentAsync(long courseId, string studentId);
        Task<bool> AcceptCourseMateAsync(long courseId, string studentId);
        Task<bool> RejectCourseMateAsync(long courseId, string studentId);
        Task<CourseDTO[]> GetUserCoursesAsync(string userId, string role);
        Task<bool> AcceptLecturerAsync(long courseId, string lecturerEmail, string lecturerId);
        Task<AccountDataDto[]> GetLecturersAvailableForCourse(long courseId, string mentorId);
        Task<string[]> GetCourseLecturers(long courseId);
    }
}
