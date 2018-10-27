using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Z.EntityFramework.Plus;

namespace HwProj.CoursesService.API.Models
{
    public class CourseRepository : ICourseRepository
    {
        private readonly CourseContext _context;

        public CourseRepository(CourseContext context)
        {
            _context = context;
        }

        public IEnumerable<Course> Courses
            => _context.Courses;

        public Course Get(long id)
        {
            return _context.Courses.FirstOrDefault(course => course.Id == id);
        }

        public Task AddAsync(Course course)
        {
            _context.Add(course);
            return _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteByIdAsync(long id)
        {
            var result = await _context.Courses.Where(course => course.Id == id).DeleteAsync();
            return result == 1;
        }

        public async Task<bool> UpdateAsync(long id, CourseViewModel courseViewModel)
        {
            return await _context.Courses.Where(course => course.Id == id)
                .UpdateAsync(course => new Course() { Name = courseViewModel.Name }) == 1;
        }
    }
}
