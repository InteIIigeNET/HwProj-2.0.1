using System;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.CoursesService.API.Domains;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class TasksService : ITasksService
    {
        private readonly ITasksRepository _tasksRepository;
        private readonly IEventBus _eventBus;
        private readonly ICoursesRepository _coursesRepository;
        private readonly IHomeworksRepository _homeworksRepository;

        public TasksService(ITasksRepository tasksRepository, IEventBus eventBus,
            ICoursesRepository coursesRepository, IHomeworksRepository homeworksRepository)
        {
            _tasksRepository = tasksRepository;
            _homeworksRepository = homeworksRepository;
            _eventBus = eventBus;
            _coursesRepository = coursesRepository;
        }

        public async Task<HomeworkTask> GetTaskAsync(long taskId)
        {
            var task = await _tasksRepository
                .FindAll(x => x.Id == taskId)
                .Include(x => x.Homework).FirstOrDefaultAsync();

            CourseDomain.FillTask(task.Homework, task);

            return task;
        }

        public async Task<HomeworkTask> GetForEditingTaskAsync(long taskId)
        {
            return await _tasksRepository
                .FindAll(x => x.Id == taskId)
                .Include(x => x.Homework)
                .FirstOrDefaultAsync();
        }

        public async Task<long> AddTaskAsync(long homeworkId, HomeworkTask task)
        {
            task.HomeworkId = homeworkId;

            var homework = await _homeworksRepository.GetAsync(task.HomeworkId);
            var course = await _coursesRepository.GetWithCourseMatesAsync(homework.CourseId);

            var taskId = await _tasksRepository.AddAsync(task);
            var deadlineDate = task.DeadlineDate ?? homework.DeadlineDate;
            var studentIds = course.CourseMates
                .Where(cm => cm.IsAccepted)
                .Select(cm => cm.StudentId)
                .ToArray();

            if (task.PublicationDate <= DateTime.UtcNow)
                _eventBus.Publish(new NewHomeworkTaskEvent(task.Title, taskId, deadlineDate, course.Name, course.Id, studentIds));

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

            var studentIds = course.CourseMates
                .Where(cm => cm.IsAccepted)
                .Select(cm => cm.StudentId)
                .ToArray();

            _eventBus.Publish(new UpdateTaskMaxRatingEvent(course.Name, course.Id, task.Title, task.Id, studentIds));

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

        public async Task<HomeworkTask[]> GetAllCourseTasks(long courseId)
        {
            var tasks = await _homeworksRepository
                .FindAll(h => h.CourseId == courseId)
                .Include(h => h.Tasks)
                .SelectMany(h => h.Tasks)
                .Include(t => t.Homework)
                .ToArrayAsync();

            var result = tasks
                .Select(t => CourseDomain.FillTask(t.Homework, t))
                .ToArray();

            return result;
        }
    }
}
