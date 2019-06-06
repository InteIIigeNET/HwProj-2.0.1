using System;
using System.Threading.Tasks;
using HwProj.HomeworkService.API.Models;
using HwProj.HomeworkService.API.Repositories;

namespace HwProj.HomeworkService.API.Services
{
    public class HomeworksService : IHomeworksService
    {
        private readonly IHomeworksRepository _homeworksRepository;

        public HomeworksService(IHomeworksRepository homeworksRepository)
        {
            _homeworksRepository = homeworksRepository;
        }

        public Task<Homework[]> GetAllHomeworksAsync()
        {
            return _homeworksRepository.GetAllWithTasksAsync();
        }

        public Task<Homework> GetHomeworkAsync(long homeworkId)
        {
            return _homeworksRepository.GetWithTasksAsync(homeworkId);
        }

        public Task<Homework[]> GetCourseHomeworksAsync(long courseId)
        {
            return _homeworksRepository.GetAllWithTasksByCourseAsync(courseId);
        }

        public Task<long> AddHomeworkAsync(long courseId, Homework homework)
        {
            homework.CourseId = courseId;
            homework.Date = DateTime.Now;
            return _homeworksRepository.AddAsync(homework);
        }

        public Task DeleteHomeworkAsync(long homeworkId)
        {
            return _homeworksRepository.DeleteAsync(homeworkId);
        }

        public Task UpdateHomeworkAsync(long homeworkId, Homework update)
        {
            return _homeworksRepository.UpdateAsync(homeworkId, homework => new Homework()
            {
                Title = update.Title,
                Description = update.Description
            });
        }
    }
}