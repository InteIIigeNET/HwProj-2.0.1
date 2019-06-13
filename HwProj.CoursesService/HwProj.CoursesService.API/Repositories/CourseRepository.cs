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

        public async Task<Course> GetWithCourseMatesAsync(long id)
        {
            return await Context.Set<Course>().Include(c => c.CourseMates)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Course[]> GetAllWithCourseMatesAsync()
        {
            return await Context.Set<Course>()
                .Include(c => c.CourseMates)
                .AsNoTracking()
                .ToArrayAsync();
        }
    }
}