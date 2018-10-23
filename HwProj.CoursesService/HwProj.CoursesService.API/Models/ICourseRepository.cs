using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models
{
    public interface ICourseRepository
    {
        IEnumerable<Course> Courses { get; }
        Task AddAndSaveAsync(Course course);
        Task<bool> DeleteByIdAndSaveAsync(long id);
        Task<bool> ModifyAndSaveAsync(long id, CourseViewModel courseViewModel);
    }
}
