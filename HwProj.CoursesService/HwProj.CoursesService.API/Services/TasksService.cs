using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Domains;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.NotificationService.Events.CoursesService;
using System.Linq;

namespace HwProj.CoursesService.API.Services
{
    public class TasksService : ITasksService
    {
        private readonly ITasksRepository _tasksRepository;
        private readonly IEventBus _eventBus;
        private readonly ICoursesRepository _coursesRepository;
        private readonly IHomeworksRepository _homeworksRepository;

        public TasksService(ITasksRepository tasksRepository, IEventBus eventBus, ICoursesRepository coursesRepository,
            IHomeworksRepository homeworksRepository)
        {
            _tasksRepository = tasksRepository;
            _homeworksRepository = homeworksRepository;
            _eventBus = eventBus;
            _coursesRepository = coursesRepository;
        }

        public async Task<HomeworkTask> GetTaskAsync(long taskId, bool withCriteria = false)
        {
            var taskFromDb = withCriteria
                ? await _tasksRepository.GetWithHomeworkAndCriteriaAsync(taskId)
                : await _tasksRepository.GetWithHomeworkAsync(taskId);

            CourseDomain.FillTask(taskFromDb.Homework, taskFromDb);

            return taskFromDb;
        }

        public async Task<HomeworkTask> GetForEditingTaskAsync(long taskId)
        {
            return await _tasksRepository.GetWithHomeworkAndCriteriaAsync(taskId);
        }

        public async Task<HomeworkTask> AddTaskAsync(
                long homeworkId,
                PostTaskViewModel taskViewModel,
                LtiLaunchData? ltiLaunchData = null)
        {
            var task = taskViewModel.ToHomeworkTask();
            task.HomeworkId = homeworkId;

            var homework = await _homeworksRepository.GetAsync(task.HomeworkId);
            var course = await _coursesRepository.GetWithCourseMatesAndHomeworksAsync(homework.CourseId);

            var taskId = await _tasksRepository.AddAsync(task);

            if (ltiLaunchData != null && !string.IsNullOrEmpty(ltiLaunchData.LtiLaunchUrl))
            {
                await _tasksRepository.AddLtiUrlAsync(taskId, ltiLaunchData);
            }

            var deadlineDate = task.DeadlineDate ?? homework.DeadlineDate;
            var studentIds = course!.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();

            if (task.PublicationDate <= DateTime.UtcNow)
                _eventBus.Publish(new NewHomeworkTaskEvent(task.Title, taskId, deadlineDate, course.Name, course.Id,
                    studentIds));

            return await GetTaskAsync(taskId, true);
        }

        public async Task DeleteTaskAsync(long taskId)
        {
            await _tasksRepository.DeleteAsync(taskId);
        }

        public async Task<HomeworkTask> UpdateTaskAsync(
            long taskId,
            PostTaskViewModel taskViewModel,
            ActionOptions options,
            LtiLaunchData? ltiLaunchData = null)
        {
            var update = taskViewModel.ToHomeworkTask();
            var task = await _tasksRepository.GetWithHomeworkAsync(taskId);
            if (task == null) throw new InvalidOperationException("Task not found");

            var course = await _coursesRepository.GetWithCourseMatesAndHomeworksAsync(task.Homework.CourseId);

            var studentIds = course.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();

            if (options.SendNotification && update.PublicationDate <= DateTime.UtcNow)
                _eventBus.Publish(new UpdateTaskMaxRatingEvent(course.Name, course.Id, task.Title, task.Id,
                    studentIds));

            await _tasksRepository.UpdateAsync(taskId, t => new HomeworkTask()
            {
                Title = update.Title,
                Description = update.Description,
                MaxRating = update.MaxRating,
                DeadlineDate = update.DeadlineDate,
                HasDeadline = update.HasDeadline,
                IsDeadlineStrict = update.IsDeadlineStrict,
                PublicationDate = update.PublicationDate,
                IsBonusExplicit = update.IsBonusExplicit,
            }, update.Criteria);

            if (ltiLaunchData != null && !string.IsNullOrEmpty(ltiLaunchData.LtiLaunchUrl)) 
            {
                await _tasksRepository.AddLtiUrlAsync(taskId, ltiLaunchData); 
            }

            return await GetTaskAsync(taskId, true);
        }

        public async Task<LtiLaunchData?> GetTaskLtiDataAsync(long taskId)
        {
            return await _tasksRepository.GetLtiDataAsync(taskId);
        }

        public async Task<Dictionary<long, LtiLaunchData>> GetLtiDataForTasksAsync(long[] taskIds)
        {
            return await _tasksRepository.GetLtiDataForTasksAsync(taskIds);
        }
    }
}
