using AutoMapper;
using HwProj.CoursesService.API.Domains;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.NotificationService.Events.CoursesService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Services
{
    public class TasksService : ITasksService
    {
        private readonly ITasksRepository _tasksRepository;
        private readonly IEventBus _eventBus;
        private readonly ICoursesRepository _coursesRepository;
        private readonly IHomeworksRepository _homeworksRepository;
        private readonly ICriterionsService _criterionsService;

        public TasksService(ITasksRepository tasksRepository, IEventBus eventBus,
            ICoursesRepository coursesRepository, IHomeworksRepository homeworksRepository, ICriterionsService criterionsService)
        {
            _tasksRepository = tasksRepository;
            _homeworksRepository = homeworksRepository;
            _eventBus = eventBus;
            _coursesRepository = coursesRepository;
            _criterionsService = criterionsService;
        }

        public async Task<HomeworkTask> GetTaskFromDbAsync(long taskId)
        {
            var task = await _tasksRepository.GetWithHomeworkAsync(taskId);

            CourseDomain.FillTask(task.Homework, task);

            return task;
        }

        public async Task<HomeworkTask> GetTaskAsync(long taskId, bool withCriterias = false)
        {
            if (withCriterias)
            {
                var taskFromDb = await _tasksRepository.GetWithHomeworkAsync(taskId);

                if (taskFromDb == null)
                {
                    return null;
                }

                CourseDomain.FillTask(taskFromDb.Homework, taskFromDb);

                taskFromDb.Criterias = (await _criterionsService.GetTaskCriteriaAsync(taskId))
                                   ?? new List<Criterion>();

                return taskFromDb;
            }

            var taskFromService = await GetTaskFromDbAsync(taskId);

            if (taskFromService == null)
            {
                return null;
            }

            return taskFromService;
        }

        public async Task<HomeworkTask> GetForEditingTaskAsync(long taskId)
        {
            var taskFromDb = await _tasksRepository.GetWithHomeworkAsync(taskId);

            if (taskFromDb == null)
            {
                return null;
            }

            taskFromDb.Criterias = await _criterionsService.GetTaskCriteriaAsync(taskId);

            return taskFromDb;
        }

        public async Task<HomeworkTask> AddTaskAsync(long homeworkId, CreateTaskViewModel taskViewModel)
        {
            var task = taskViewModel.ToHomeworkTask();
            task.HomeworkId = homeworkId;

            var homework = await _homeworksRepository.GetAsync(task.HomeworkId);
            var course = await _coursesRepository.GetWithCourseMatesAndHomeworksAsync(homework.CourseId);

            var taskId = await _tasksRepository.AddAsync(task);
            var deadlineDate = task.DeadlineDate ?? homework.DeadlineDate;
            var studentIds = course.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();

            if (task.PublicationDate <= DateTime.UtcNow)
                _eventBus.Publish(new NewHomeworkTaskEvent(task.Title, taskId, deadlineDate, course.Name, course.Id,
                    studentIds));

            await _criterionsService.AddCriterionAsync(taskViewModel.Criterias, task.Id);

            return await GetTaskFromDbAsync(taskId);
        }

        public async Task DeleteTaskAsync(long taskId)
        {
            await _tasksRepository.DeleteAsync(taskId);
        }

        public async Task<HomeworkTask> UpdateTaskAsync(long taskId, EditTaskViewModel taskViewModel, ActionOptions options)
        {
            await _criterionsService.UpdateTaskCriteriaAsync(taskViewModel, taskId);
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
                PublicationDate = update.PublicationDate
            });

            var updatedTask = await _tasksRepository.GetAsync(taskId);
            updatedTask.Homework = task.Homework;
            CourseDomain.FillTask(updatedTask.Homework, updatedTask);
            return updatedTask;
        }
    }
}
