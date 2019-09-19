using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using Microsoft.EntityFrameworkCore;

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

        public async Task<Course[]> GetAllAsync()
        {
            return await _courseRepository.GetAllWithCourseMatesAsync();
        }

        public async Task<Course> GetAsync(long id)
        {
            return await _courseRepository.GetWithCourseMatesAsync(id);
        }

        public async Task<long> AddAsync(Course course, string mentorId)
        {
            course.MentorId = mentorId;
            return await _courseRepository.AddAsync(course);
        }

        public async Task DeleteAsync(long id)
        {
            await _courseRepository.DeleteAsync(id);
        }

        public async Task UpdateAsync(long courseId, Course updated)
        {
            await _courseRepository.UpdateAsync(courseId, c => new Course
            {
                Name = updated.Name,
                GroupName = updated.GroupName,
                IsComplete = updated.IsComplete,
                IsOpen = updated.IsOpen
            });
        }

        public async Task<bool> AddStudentAsync(long courseId, string studentId)
        {
            var getCourseTask = _courseRepository.GetAsync(courseId);
            var getCourseMateTask =
                _courseMateRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await Task.WhenAll(getCourseTask, getCourseMateTask);

            if (getCourseTask.Result == null)
            {
                return false;
            }

            if (getCourseMateTask.Result != null)
            {
                return true;
            }

            var courseMate = new CourseMate
            {
                CourseId = courseId,
                StudentId = studentId,
                IsAccepted = getCourseTask.Result.IsOpen
            };

            await _courseMateRepository.AddAsync(courseMate);
            return true;
        }

        public async Task<bool> AcceptCourseMateAsync(long courseId, string studentId)
        {
            var getCourseTask = _courseRepository.GetAsync(courseId);
            var getCourseMateTask =
                _courseMateRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await Task.WhenAll(getCourseTask, getCourseMateTask);

            if (getCourseTask.Result == null || getCourseMateTask.Result == null)
            {
                return false;
            }

            await _courseMateRepository.UpdateAsync(
                getCourseMateTask.Result.Id,
                cm => new CourseMate {IsAccepted = true}
            );
            return true;
        }

        public async Task<bool> RejectCourseMateAsync(long courseId, string studentId)
        {
            var getCourseTask = _courseRepository.GetAsync(courseId);
            var getCourseMateTask =
                _courseMateRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await Task.WhenAll(getCourseTask, getCourseMateTask);

            if (getCourseTask.Result == null || getCourseMateTask.Result == null)
            {
                return false;
            }

            await _courseMateRepository.DeleteAsync(getCourseMateTask.Result.Id);
            return true;
        }

        public async Task<long[]> GetStudentCourseIdsAsync(string studentId)
        {
            return await _courseMateRepository
                .FindAll(cm => cm.StudentId == studentId && cm.IsAccepted == true)
                .Select(cm => cm.CourseId)
                .ToArrayAsync();
        }

        public async Task<long[]> GetMentorCourseIdsAsync(string mentorId)
        {
            return await _courseRepository
                .FindAll(c => c.MentorId == mentorId)
                .Select(c => c.Id)
                .ToArrayAsync();
        }
    }
}