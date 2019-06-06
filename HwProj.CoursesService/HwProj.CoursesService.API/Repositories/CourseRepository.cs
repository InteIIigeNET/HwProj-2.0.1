using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    public class CourseRepository : CrudRepository<Course>, ICourseRepository
    {
        public CourseRepository(CourseContext context)
            : base(context)
        {
        }

        public Task<Course> GetWithCourseMatesAsync(long id)
            => _context.Set<Course>().Include(c => c.CourseMates).FirstOrDefaultAsync(c => c.Id == id);

        public Task<Course[]> GetAllWithCourseMatesAsync()
            => _context.Set<Course>()
                .Include(c => c.CourseMates)
                .AsNoTracking()
                .ToArrayAsync();
    }
}
