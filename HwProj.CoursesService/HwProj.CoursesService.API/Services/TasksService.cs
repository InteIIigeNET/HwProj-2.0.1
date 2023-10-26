using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;
using static System.TimeSpan;
using HwProj.Events.CourseEvents;

namespace HwProj.CoursesService.API.Services
{
    public class TasksService : ITasksService
    {
        private readonly ITasksRepository _tasksRepository;
        private readonly IEventBus _eventBus;
        private readonly IMapper _mapper;
        private readonly ICoursesRepository _coursesRepository;
        private readonly IHomeworksRepository _homeworksRepository;
        private readonly ICoursesService _coursesService;

        public TasksService(ITasksRepository tasksRepository, IEventBus eventBus, IMapper mapper,
            ICoursesRepository coursesRepository, IHomeworksRepository homeworksRepository,
            ICoursesService coursesService)
        {
            _tasksRepository = tasksRepository;
            _homeworksRepository = homeworksRepository;
            _coursesService = coursesService;
            _eventBus = eventBus;
            _mapper = mapper;
            _coursesRepository = coursesRepository;
        }

        public async Task<HomeworkTask> GetTaskAsync(long taskId)
        {
            return await _tasksRepository.GetAsync(taskId);
        }

        public async Task<long> AddTaskAsync(long homeworkId, HomeworkTask task)
        {
            task.HomeworkId = homeworkId;

            var homework = await _homeworksRepository.GetAsync(task.HomeworkId);
            var course = await _coursesRepository.GetWithCourseMatesAsync(homework.CourseId);
            var courseModel = _mapper.Map<CourseDTO>(course);

            var taskId = await _tasksRepository.AddAsync(task);

            _eventBus.Publish(new NewTaskEvent(task.Title, taskId, task.DeadlineDate, task.PublicationDate,
                courseModel));

            return taskId;
        }

        public async Task DeleteTaskAsync(long taskId)
        {
            _eventBus.Publish(new DeleteTaskEvent(taskId));
            await _tasksRepository.DeleteAsync(taskId);
        }

        public async Task UpdateTaskAsync(long taskId, HomeworkTask update)
        {
            var task = await _tasksRepository.GetAsync(taskId);
            var homework = await _homeworksRepository.GetAsync(task.HomeworkId);
            var course = await _coursesRepository.GetWithCourseMatesAsync(homework.CourseId);
            var courseModel = _mapper.Map<CourseDTO>(course);


            _eventBus.Publish(new UpdateTaskEvent(courseModel, update.Title, taskId, update.PublicationDate));

            await _tasksRepository.UpdateAsync(taskId, t => new HomeworkTask()
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