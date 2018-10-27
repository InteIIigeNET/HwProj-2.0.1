using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models
{
    public interface ICourseRepository
    {
        Task<Course> GetAsync(long id);
        IEnumerable<Course> Courses { get; }
        Task AddAsync(Course course);
        Task<bool> DeleteByIdAsync(long id);
        Task<bool> UpdateAsync(long id, CourseViewModel courseViewModel);
    }
}
