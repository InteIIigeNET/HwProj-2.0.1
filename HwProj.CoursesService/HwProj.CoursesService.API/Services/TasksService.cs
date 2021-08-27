using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.CoursesService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class TasksService : ITasksService
    {
        private readonly ITasksRepository _tasksRepository;
        private readonly IEventBus _eventBus;
        private readonly IMapper _mapper;
        private readonly ICoursesServiceClient _corsesServiceClient;
        public TasksService(ITasksRepository tasksRepository, IEventBus eventBus, IMapper mapper, ICoursesServiceClient corsesServiceClient)
        {
            _tasksRepository = tasksRepository;
            _eventBus = eventBus;
            _mapper = mapper;
            _corsesServiceClient = corsesServiceClient;
        }

        public async Task<HomeworkTask> GetTaskAsync(long taskId)
        {
            return await _tasksRepository.GetAsync(taskId);
        }

        public async Task<long> AddTaskAsync(long homeworkId, HomeworkTask task)
        {
            task.HomeworkId = homeworkId;
            return await _tasksRepository.AddAsync(task);
        }

        public async Task DeleteTaskAsync(long taskId)
        {
            await _tasksRepository.DeleteAsync(taskId);
        }

        public async Task UpdateTaskAsync(long taskId, HomeworkTask update)
        {
            var taskModel = _mapper.Map<HomeworkTaskViewModel>(update);
            var homework = await _corsesServiceClient.GetHomework(update.HomeworkId);
            var homeworkModel = _mapper.Map<HomeworkViewModel>(homework);
            var course = await _corsesServiceClient.GetCourseById(homeworkModel.CourseId, "");
            var courseModel = _mapper.Map<CourseViewModel>(course);
            _eventBus.Publish(new UpdateTaskMaxRatingEvent(courseModel, taskModel, update.MaxRating));

            await _tasksRepository.UpdateAsync(taskId, task => new HomeworkTask()
            {
                Title = update.Title,
                Description = update.Description,
                MaxRating = update.MaxRating,
                DeadlineDate = update.DeadlineDate,
                HasDeadline = update.HasDeadline,
                IsDeadlineStrict = update.IsDeadlineStrict,
                PublicationDate = update.PublicationDate
            });
        }
    }
}
