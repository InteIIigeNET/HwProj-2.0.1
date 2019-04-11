using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models.ViewModels;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Models.Repositories
{
    public class CourseRepository : CrudRepository<Course>, ICourseRepository
    {
        public CourseRepository(CourseContext context)
            : base(context)
        {
        }

        public Task<Course> GetWithCourseMatesAsync(long id)
            => _context.Set<Course>().Include(c => c.CourseMates).FirstOrDefaultAsync(c => c.Id == id);

        public Task<List<Course>> GetAllWithCourseMatesAsync()
            => _context.Set<Course>().Include(c => c.CourseMates).AsNoTracking().ToListAsync();
    }
}
