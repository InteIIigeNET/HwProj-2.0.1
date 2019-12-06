using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.DTO;
using HwProj.CoursesService.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class CoursesService : ICoursesService
    {
        private readonly ICoursesRepository _coursesRepository;
        private readonly ICourseMatesRepository _courseMatesRepository;
        private readonly IMapper _mapper;

        public CoursesService(ICoursesRepository coursesRepository,
            ICourseMatesRepository courseMatesRepository,
            IMapper mapper)
        {
            _coursesRepository = coursesRepository;
            _courseMatesRepository = courseMatesRepository;
            _mapper = mapper;
        }

        public async Task<Course[]> GetAllAsync()
        {
            return await _coursesRepository.GetAllWithCourseMates().ToArrayAsync();
        }

        public async Task<Course> GetAsync(long id)
        {
            return await _coursesRepository.GetWithCourseMatesAsync(id);
        }

        public async Task<long> AddAsync(Course course, string mentorId)
        {
            course.MentorId = mentorId;
            return await _coursesRepository.AddAsync(course);
        }

        public async Task DeleteAsync(long id)
        {
            await _coursesRepository.DeleteAsync(id);
        }

        public async Task UpdateAsync(long courseId, Course updated)
        {
            await _coursesRepository.UpdateAsync(courseId, c => new Course
            {
                Name = updated.Name,
                GroupName = updated.GroupName,
                IsComplete = updated.IsComplete,
                IsOpen = updated.IsOpen
            });
        }

        public async Task<bool> AddStudentAsync(long courseId, string studentId)
        {
            var getCourseTask = _coursesRepository.GetAsync(courseId);
            var getCourseMateTask =
                _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await Task.WhenAll(getCourseTask, getCourseMateTask);

            if (getCourseTask.Result == null || getCourseMateTask.Result != null)
            {
                return false;
            }

            var courseMate = new CourseMate
            {
                CourseId = courseId,
                StudentId = studentId,
                IsAccepted = getCourseTask.Result.IsOpen
            };

            await _courseMatesRepository.AddAsync(courseMate);
            return true;
        }

        public async Task<bool> AcceptCourseMateAsync(long courseId, string studentId)
        {
            var getCourseTask = _coursesRepository.GetAsync(courseId);
            var getCourseMateTask =
                _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await Task.WhenAll(getCourseTask, getCourseMateTask);

            if (getCourseTask.Result == null || getCourseMateTask.Result == null)
            {
                return false;
            }

            await _courseMatesRepository.UpdateAsync(
                getCourseMateTask.Result.Id,
                cm => new CourseMate {IsAccepted = true}
            );
            return true;
        }

        public async Task<bool> RejectCourseMateAsync(long courseId, string studentId)
        {
            var getCourseTask = _coursesRepository.GetAsync(courseId);
            var getCourseMateTask =
                _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await Task.WhenAll(getCourseTask, getCourseMateTask);

            if (getCourseTask.Result == null || getCourseMateTask.Result == null)
            {
                return false;
            }

            await _courseMatesRepository.DeleteAsync(getCourseMateTask.Result.Id);
            return true;
        }

        public async Task<UserCourseDescription[]> GetUserCoursesAsync(string userId)
        {
            var studentCoursesIds = await _courseMatesRepository
                .FindAll(cm => cm.StudentId == userId && cm.IsAccepted == true)
                .Select(cm => cm.CourseId)
                .ToArrayAsync()
                .ConfigureAwait(false);

            var getStudentCoursesTasks = studentCoursesIds
                .Select(id => _coursesRepository.GetAsync(id)) // TODO: optimize 
                .ToArray();

            var studentCourses = await Task.WhenAll(getStudentCoursesTasks).ConfigureAwait(false);

            var getMentorCoursesTask = _coursesRepository
                .FindAll(c => c.MentorId == userId)
                .ToArrayAsync();

            var mentorCourses = await getMentorCoursesTask.ConfigureAwait(false);

            return studentCourses
                .Union(mentorCourses)
                .Select(c =>
                {
                    var userCourseDescription = _mapper.Map<UserCourseDescription>(c);
                    userCourseDescription.UserIsMentor = c.MentorId == userId;
                    return userCourseDescription;
                })
                .OrderBy(c => c.UserIsMentor).ThenBy(c => c.Name)
                .ToArray();
        }
    }
}