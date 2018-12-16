using HwProj.CoursesService.API.Models.ViewModels;
using HwProj.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models.Repositories
{
    public interface ICourseRepository : ICrudRepository<Course>
    {
        Task<Course> GetAsync(long id);
        Task<bool> DeleteByIdAsync(long id);
        Task<bool> UpdateAsync(long id, UpdateCourseViewModel courseViewModel);
        Task<bool> AddStudentAsync(long courseId, User user);
        Task<bool> AcceptStudentAsync(long courseId, User user);
        Task<bool> RejectStudentAsync(long courseId, User user);
    }
}
