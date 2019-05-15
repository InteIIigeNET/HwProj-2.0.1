using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.Repositories;
using Microsoft.EntityFrameworkCore.Internal;

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

        public Task<List<Course>> GetAllAsync()
            => _courseRepository.GetAllWithCourseMatesAsync();

        public Task<Course> GetAsync(long id)
            => _courseRepository.GetWithCourseMatesAsync(id);

        public Task<long> AddAsync(Course course)
            => _courseRepository.AddAsync(course);

        public Task DeleteAsync(long id)
            => _courseRepository.DeleteAsync(id);

        public Task UpdateAsync(long courseId, Expression<Func<Course, Course>> updateFactory)
            => _courseRepository.UpdateAsync(courseId, updateFactory);

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

        public List<long> GetStudentCourses(string studentId)
            => _courseMateRepository
                .FindAll(cm => cm.StudentId == studentId && cm.IsAccepted)
                .Select(cm => cm.CourseId)
                .ToList();

        public List<long> GetMentorCourses(string mentorId)
            => _courseRepository
                .FindAll(c => c.MentorId == mentorId)
                .Select(c => c.Id)
                .ToList();
    }
}