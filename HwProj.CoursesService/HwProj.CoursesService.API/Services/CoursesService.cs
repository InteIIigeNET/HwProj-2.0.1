using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;

namespace HwProj.CoursesService.API.Services
{
    public class CoursesService : ICoursesService
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ICourseMateRepository _courseMateRepository;

        public CoursesService(ICourseRepository courseRepository, ICourseMateRepository courseMateRepository)
        {
            _courseRepository = courseRepository;
            _courseMateRepository = courseMateRepository;
        }

        public Task<Course[]> GetAllAsync()
        {
            return _courseRepository.GetAllWithCourseMatesAsync();
        }

        public Task<Course> GetAsync(long id)
        {
            return _courseRepository.GetWithCourseMatesAsync(id);
        }

        public Task<long> AddAsync(Course course, string mentorId)
        {
            course.MentorId = mentorId;
            return _courseRepository.AddAsync(course);
        }

        public Task DeleteAsync(long id)
        {
            return _courseRepository.DeleteAsync(id);
        }

        public Task UpdateAsync(long courseId, Course updated)
        {
            return _courseRepository.UpdateAsync(courseId, course => new Course()
            {
                Name = updated.Name,
                GroupName = updated.GroupName,
                IsComplete = updated.IsComplete,
                IsOpen = updated.IsOpen
            });
        }

        public async Task<bool> AddStudentAsync(long courseId, string studentId)
        {
            var course = await _courseRepository.GetAsync(courseId);
            if (course == null)
            {
                return false;
            }

            if (await _courseMateRepository
                .FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId) != null)
            {
                return true;
            }
            
            var courseMate = new CourseMate()
            {
                CourseId = courseId,
                StudentId = studentId,
                IsAccepted = course.IsOpen
            };
            await _courseMateRepository.AddAsync(courseMate);

            return true;
        }

        public async Task<bool> AcceptCourseMateAsync(long courseId, string studentId)
        {
            var courseMate = await _courseMateRepository
                .FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);

            if (courseMate == null)
            {
                return false;
            }
            
            await _courseMateRepository.UpdateAsync(courseMate.Id, cm => new CourseMate() {IsAccepted = true});
            return true;
        }

        public async Task<bool> RejectCourseMateAsync(long courseId, string studentId)
        {
            var courseMate = await _courseMateRepository
                .FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);

            if (courseMate == null)
            {
                return false;
            }
            
            await _courseMateRepository.DeleteAsync(courseMate.Id);
            return true;
        }

        public long[] GetStudentCourses(string studentId)
        {
            return _courseMateRepository
                .FindAll(cm => cm.StudentId == studentId && cm.IsAccepted)
                .Select(cm => cm.CourseId)
                .ToArray();
        }

        public long[] GetMentorCourses(string mentorId)
        {
            return _courseRepository
                .FindAll(c => c.MentorId == mentorId)
                .Select(c => c.Id)
                .ToArray();
        }
    }
}