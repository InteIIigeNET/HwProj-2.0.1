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

        public async Task<bool> AddStudent(long courseId, long studentId)
        {
            var course = await _courseRepository.GetAsync(courseId);
            if (course == null ||_courseMateRepository
                    .FindAll(mate => mate.CourseId == courseId && mate.StudentId == studentId).Any())
            {
                return false;
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

        public async Task<bool> AcceptCourseMate(long courseId, long studentId)
        {
            var courseMate = await _courseMateRepository
                .FindAsync(cs => cs.CourseId == courseId && cs.StudentId == studentId);

            if (courseMate == null)
            {
                return false;
            }
            
            await _courseMateRepository.UpdateAsync(courseMate.Id, cm => new CourseMate() {IsAccepted = true});
            return true;
        }

        public async Task<bool> RejectCourseMate(long courseId, long studentId)
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

        public List<long> GetStudentCourses(long studentId)
            => _courseMateRepository
                .FindAll(cs => cs.StudentId == studentId && cs.IsAccepted)
                .Select(cs => cs.CourseId)
                .ToList();

        public List<long> GetMentorCourses(long mentorId)
            => _courseRepository
                .FindAll(c => c.MentorId == mentorId)
                .Select(c => c.Id)
                .ToList();
    }
}