using HwProj.CoursesService.API.Models.ViewModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models
{
    public interface ICourseRepository
    {
        Task<Course> GetAsync(long id);
        IReadOnlyCollection<Course> Courses { get; }
        Task AddAsync(Course course);
        Task<bool> DeleteByIdAsync(long id);
        Task<bool> UpdateAsync(long id, UpdateCourseViewModel courseViwModel);
        Task<bool> AddStudentAsync(long courseId, string userId);
        Task<bool> AcceptStudentAsync(long courseId, string userId);
        Task<bool> RejectStudentAsync(long courseId, string userId);

        //временные методы
        IReadOnlyCollection<User> Users { get; }
        Task<User> GetUserAsync(string userId);
        Task AddUserAsync(User user);
    }
}
