using System;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;

namespace HwProj.CoursesService.API.Services
{
    public class HomeworksService : IHomeworksService
    {
        private readonly IHomeworksRepository _homeworksRepository;

        public HomeworksService(IHomeworksRepository homeworksRepository)
        {
            _homeworksRepository = homeworksRepository;
        }
        
        public async Task<long> AddHomeworkAsync(long courseId, Homework homework)
        {
            homework.CourseId = courseId;
            homework.Date = DateTime.Now;
            return await _homeworksRepository.AddAsync(homework);
        }

        public async Task<Homework> GetHomeworkAsync(long homeworkId)
        {
            return await _homeworksRepository.GetWithTasksAsync(homeworkId);
        }

        public async Task DeleteHomeworkAsync(long homeworkId)
        {
            await _homeworksRepository.DeleteAsync(homeworkId);
        }

        public async Task UpdateHomeworkAsync(long homeworkId, Homework update)
        {
            await _homeworksRepository.UpdateAsync(homeworkId, homework => new Homework()
            {
                Title = update.Title,
                Description = update.Description
            });
        }
    }
}
