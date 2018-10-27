using Microsoft.EntityFrameworkCore;
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

        public IReadOnlyCollection<Course> Courses
            => _context.Courses.AsNoTracking().ToArray();

        public Task<Course> GetAsync(long id)
        {
            return _context.Courses.FindAsync(id);
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
                .UpdateAsync(course => new Course() {
                    Name = courseViewModel.Name,
                    GroupName = courseViewModel.GroupName,
                    IsOpen = courseViewModel.IsOpen
                }) == 1;
        }
    }
}
