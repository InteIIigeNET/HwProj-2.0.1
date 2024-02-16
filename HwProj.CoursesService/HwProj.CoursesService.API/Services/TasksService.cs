using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Events.CourseEvents;

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
            var taskModel = _mapper.Map<HomeworkTaskDTO>(task);
            var taskId = await _tasksRepository.AddAsync(task);

            _eventBus.Publish(new NewTaskEvent(taskId, taskModel, courseModel));

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
            var previousTaskModel = _mapper.Map<HomeworkTaskDTO>(task);
            var newTaskModel = _mapper.Map<HomeworkTaskDTO>(update);

            _eventBus.Publish(new UpdateTaskEvent(taskId, previousTaskModel, newTaskModel, courseModel));

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
