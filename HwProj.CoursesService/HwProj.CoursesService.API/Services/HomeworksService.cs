using System;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.Client;

namespace HwProj.CoursesService.API.Services
{
    public class HomeworksService : IHomeworksService
    {
        private readonly IHomeworksRepository _homeworksRepository;
        private readonly IEventBus _eventBus;
        private readonly IMapper _mapper;
        private readonly ICoursesServiceClient _corsesServiceClient;
        public HomeworksService(IHomeworksRepository homeworksRepository, IEventBus eventBus, IMapper mapper, ICoursesServiceClient corsesServiceClient)
        {
            _homeworksRepository = homeworksRepository;
            _eventBus = eventBus;
            _mapper = mapper;
            _corsesServiceClient = corsesServiceClient;
        }
        
        public async Task<long> AddHomeworkAsync(long courseId, Homework homework)
        {
            homework.CourseId = courseId;
            homework.Date = DateTime.Now;
/*
            var course = await _corsesServiceClient.GetCourseById(courseId, homework.)   как достать UserId
            _eventBus.Publish(new NewTaskEvent(homework.Title, courseId));
*/
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
