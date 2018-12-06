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
            => _context.Courses
            .Include(c => c.CourseStudents)
                .ThenInclude(cs => cs.Student)
            .AsNoTracking().ToArray();

        public Task<Course> GetAsync(long id)
            => _context.Courses
                .Include(c => c.CourseStudents).
                    ThenInclude(cs => cs.Student)
                .FirstOrDefaultAsync(c => c.Id == id);

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

        public async Task<bool> AddStudentAsync(long courseId, long userId)
        {
            var course = await GetAsync(courseId);
            var user = await GetUserAsync(userId);

            if (course == null || user == null || course.CourseStudents.Exists(cs => cs.StudentId == userId))
            {
                return false;
            }

            course.CourseStudents.Add(new CourseStudent(course, user));
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> AcceptStudentAsync(long courseId, long userId)
        {
            var course = await GetAsync(courseId);
            var student = course.CourseStudents.Single(cs => cs.StudentId == userId);

            if (course == null || student == null)
            {
                return false;
            }

            student.IsAccepted = true;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RejectStudentAsync(long courseId, long userId)
        {
            var course = await GetAsync(courseId);
            var student = course.CourseStudents.Single(cs => cs.StudentId == userId);

            if (course == null || student == null || course.IsOpen)
            {
                return false;
            }

            var result = course.CourseStudents.Remove(student);
            await _context.SaveChangesAsync();

            return result;
        }

        #region временные методы для работы с юзерами

        public Task AddUserAsync(User user)
        {
            _context.Users.Add(user);
            return _context.SaveChangesAsync();
        }

        public IReadOnlyCollection<User> Users
            => _context.Users
            .Include(u => u.CourseStudents)
                .ThenInclude(cs => cs.Course)
            .AsNoTracking().ToArray();

        public Task<User> GetUserAsync(long userId) 
            => _context.Users
                .Include(u => u.CourseStudents)
                    .ThenInclude(cs => cs.Course)
                .SingleAsync(u => u.Id == userId);

        #endregion
    }
}
