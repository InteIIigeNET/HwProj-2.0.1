using HwProj.CoursesService.API.Models.ViewModels;
using Microsoft.EntityFrameworkCore;
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
                .Include(c => c.Mentor)
                .Include(c => c.CourseStudents)
                    .ThenInclude(cs => cs.Student)
                .AsNoTracking().ToArray();

        public Task<Course> GetAsync(long id)
            => _context.Courses
                .Include(c => c.Mentor)
                .Include(c => c.CourseStudents).
                    ThenInclude(cs => cs.Student)
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task AddAsync(Course course)
        {
            await _context.AddAsync(course);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteByIdAsync(long id)
            => await _context.Courses.Where(course => course.Id == id).DeleteAsync() == 1;

        public async Task<bool> UpdateAsync(long id, UpdateCourseViewModel courseViewModel)
            => await _context.Courses.Where(course => course.Id == id)
                .UpdateAsync(course => new Course() {
                    Name = courseViewModel.Name,
                    GroupName = courseViewModel.GroupName,
                    IsOpen = courseViewModel.IsOpen,
                    IsComplete = courseViewModel.IsComplete
                }) == 1;

        public async Task<bool> AddStudentAsync(long courseId, string userId)
        {
            var getCourseTask = GetAsync(courseId);
            var getUserTask = GetUserAsync(userId);
            await Task.WhenAll(getCourseTask, getUserTask);

            var course = getCourseTask.Result;
            var user = getUserTask.Result;

            if (course == null || user == null || course.CourseStudents.Exists(cs => cs.StudentId == userId)
                || course.MentorId == user.Id || course.IsComplete)
            {
                return false;
            }

            course.CourseStudents.Add(new CourseStudent(course, user));
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> AcceptStudentAsync(long courseId, string userId)
        {
            var course = await GetAsync(courseId);
            var student = course?.CourseStudents.FirstOrDefault(cs => cs.StudentId == userId);

            if (course == null || student == null)
            {
                return false;
            }

            student.IsAccepted = true;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RejectStudentAsync(long courseId, string userId)
        {
            var course = await GetAsync(courseId);
            var student = course?.CourseStudents.FirstOrDefault(cs => cs.StudentId == userId);

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

        public Task<User> GetUserAsync(string userId) 
            => _context.Users
                .Include(u => u.CourseStudents)
                    .ThenInclude(cs => cs.Course)
                .FirstOrDefaultAsync(u => u.Id == userId);

        #endregion
    }
}
