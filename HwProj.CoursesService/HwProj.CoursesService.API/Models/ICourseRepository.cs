using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models
{
    public interface ICourseRepository
    {
        Task<Course> GetAsync(long id);
        IReadOnlyCollection<Course> Courses { get; }
        Task AddAsync(Course course);
        Task<bool> DeleteByIdAsync(long id);
        Task<bool> UpdateAsync(long id, CourseViewModel courseViwModel);
        Task<bool> AddStudentAsync(long courseId, long userId);
        Task<bool> AcceptStudentAsync(long courseId, long userId);

        //временные методы
        IReadOnlyCollection<User> Users { get; }
        Task<User> GetUserAsync(long userId);
        Task AddUserAsync(User user);
    }
}
