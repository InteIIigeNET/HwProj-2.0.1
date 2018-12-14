using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Models.Repositories
{
    public class CourseRepository : BaseRepository<Course>, ICourseRepository
    {
        public CourseRepository(CourseContext context)
            : base(context)
        {
        }

        protected override IQueryable<Course> GetEntities()
            => GetAllEntites()
                .Include(c => c.Mentor)
                .Include(c => c.CourseStudents)
                    .ThenInclude(cs => cs.Student);

        public Task<Course> GetAsync(long id)
            => GetAsync(course => course.Id == id);

        public Task<bool> DeleteByIdAsync(long id)
            => DeleteAsync(c => c.Id == id);

        public Task<bool> UpdateAsync(long id, UpdateCourseViewModel courseViewModel)
            => UpdateAsync(c => c.Id == id, c => new Course()
            {
                Name = courseViewModel.Name,
                GroupName = courseViewModel.GroupName,
                IsOpen = courseViewModel.IsOpen,
                IsComplete = courseViewModel.IsComplete
            });

        public async Task<bool> AddStudentAsync(long courseId, User user)
        {
            var course = await GetAsync(courseId);

            if (course == null || user == null || course.CourseStudents.Exists(cs => cs.Student.Equals(user))
                || course.Mentor.Equals(user) || course.IsComplete)
            {
                return false;
            }

            course.CourseStudents.Add(new CourseStudent(course, user));
            await SaveAsync();

            return true;
        }

        public async Task<bool> AcceptStudentAsync(long courseId, User user)
        {
            var course = await GetAsync(courseId);
            var student = course?.CourseStudents.FirstOrDefault(cs => cs.Student.Equals(user));

            if (course == null || student == null)
            {
                return false;
            }

            student.IsAccepted = true;
            await SaveAsync();

            return true;
        }

        public async Task<bool> RejectStudentAsync(long courseId, User user)
        {
            var course = await GetAsync(courseId);
            var student = course?.CourseStudents.FirstOrDefault(cs => cs.Student.Equals(user));

            if (course == null || student == null || course.IsOpen)
            {
                return false;
            }

            var result = course.CourseStudents.Remove(student);
            await SaveAsync();

            return result;
        }
    }
}
