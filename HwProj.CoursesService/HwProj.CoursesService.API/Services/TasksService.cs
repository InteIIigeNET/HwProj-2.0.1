using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models;
using HwProj.CoursesService.API.Domains;
using System.Linq;

namespace HwProj.CoursesService.API.Services
{
    public class TasksService : ITasksService
    {
        private readonly ITasksRepository _tasksRepository;
        private readonly IEventBus _eventBus;
        private readonly ICoursesRepository _coursesRepository;
        private readonly IHomeworksRepository _homeworksRepository;
        private readonly ICoursesService _coursesService;

        public TasksService(ITasksRepository tasksRepository, IEventBus eventBus, IMapper mapper,
            ICoursesRepository coursesRepository, IHomeworksRepository homeworksRepository, ICoursesService coursesService)
        {
            _tasksRepository = tasksRepository;
            _homeworksRepository = homeworksRepository;
            _coursesService = coursesService;
            _eventBus = eventBus;
            _coursesRepository = coursesRepository;
        }

        public async Task<HomeworkTask> GetTaskAsync(long taskId)
        {
            var task = await _tasksRepository.GetAsync(taskId);
            var homework = await _homeworksRepository.GetAsync(task.HomeworkId);

            CourseDomain.FillTask(homework, task);

            return task;
        }

        public async Task<HomeworkTask> GetForEditingTaskAsync(long taskId)
        {
            return await _tasksRepository.GetAsync(taskId);
        }

        public async Task<long> AddTaskAsync(long homeworkId, HomeworkTask task)
        {
            task.HomeworkId = homeworkId;

            var homework = await _homeworksRepository.GetAsync(task.HomeworkId);
            var course = await _coursesRepository.GetWithCourseMatesAsync(homework.CourseId);
            var courseModel = course.ToCourseDto();

            var taskId = await _tasksRepository.AddAsync(task);
            var deadlineDate = task.DeadlineDate ?? homework.DeadlineDate;
            var studentIds = courseModel.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();

            if (task.PublicationDate <= DateTimeUtils.GetMoscowNow())
                _eventBus.Publish(new NewHomeworkTaskEvent(task.Title, taskId, deadlineDate, courseModel.Name, courseModel.Id, studentIds));

            return taskId;
        }

        public async Task DeleteTaskAsync(long taskId)
        {
            await _tasksRepository.DeleteAsync(taskId);
        }

        public async Task UpdateTaskAsync(long taskId, HomeworkTask update)
        {
            var task = await _tasksRepository.GetAsync(taskId);
            var homework = await _homeworksRepository.GetAsync(task.HomeworkId);
            var course = await _coursesRepository.GetWithCourseMatesAsync(homework.CourseId);
            var courseModel = course.ToCourseDto();
            var studentIds = courseModel.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();

            _eventBus.Publish(new UpdateTaskMaxRatingEvent(courseModel.Name, courseModel.Id, task.Title, task.Id, studentIds));

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
