using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.CoursesService.API.Domains;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.NotificationService.Events.CoursesService;

namespace HwProj.CoursesService.API.Services
{
    public class HomeworksService : IHomeworksService
    {
        private readonly IHomeworksRepository _homeworksRepository;
        private readonly IEventBus _eventBus;
        private readonly ICoursesRepository _coursesRepository;
        private readonly ITasksRepository _tasksRepository;
        private readonly ITasksService _tasksService;

        public HomeworksService(IHomeworksRepository homeworksRepository, IEventBus eventBus,
            ICoursesRepository coursesRepository, ITasksRepository tasksRepository, ITasksService tasksService)
        {
            _homeworksRepository = homeworksRepository;
            _eventBus = eventBus;
            _coursesRepository = coursesRepository;
            _tasksRepository = tasksRepository;
            _tasksService = tasksService;
        }

        public async Task<HomeworkViewModel> AddHomeworkAsync(long courseId, CreateHomeworkViewModel homeworkViewModel)
        {
            homeworkViewModel.Tags = homeworkViewModel.Tags.Where(t => !string.IsNullOrWhiteSpace(t)).ToList();
            var homework = homeworkViewModel.ToHomework();
            homework.CourseId = courseId;

            var course = await _coursesRepository.GetWithCourseMatesAndHomeworksAsync(courseId);
            var studentIds = course.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();
            if (DateTime.UtcNow >= homework.PublicationDate)
            {
                _eventBus.Publish(new NewHomeworkEvent(homework.Title, course.Name, course.Id, studentIds,
                    homework.DeadlineDate));
            }

            await _homeworksRepository.AddAsync(homework);
            var savedHomework = await GetHomeworkAsync(homework.Id, withCriteria: true);

            if (homeworkViewModel.Tasks == null || homework.Tasks == null) return savedHomework;

            var createdTasks = homework.Tasks.ToList();

            for (var i = 0; i < createdTasks.Count && i < homeworkViewModel.Tasks.Count; i++)
            {
                var taskModel = homeworkViewModel.Tasks[i];
                var ltiLaunchData = taskModel.LtiLaunchData.ToLtiLaunchData();
                if (ltiLaunchData == null)
                {
                    continue;
                }

                await _tasksRepository.AddOrUpdateLtiLaunchDataAsync(createdTasks[i].Id, ltiLaunchData);
                savedHomework.Tasks[i].LtiLaunchData = taskModel.LtiLaunchData;
            }

            return savedHomework;
        }

        public async Task<HomeworkViewModel> GetHomeworkAsync(long homeworkId, bool withCriteria = false)
        {
            var homework = await _homeworksRepository.GetWithTasksAsync(homeworkId, withCriteria);

            CourseDomain.FillTasksInHomework(homework);

            var resultViewModelHomework = homework.ToHomeworkViewModel();
            await _tasksService.FillLtiLaunchDataForTasks(resultViewModelHomework);

            return resultViewModelHomework;
        }

        public async Task<HomeworkViewModel> GetForEditingHomeworkAsync(long homeworkId)
        {
            var homework = await _homeworksRepository.GetWithTasksAsync(homeworkId);
            var result = homework.ToHomeworkViewModel();
            await _tasksService.FillLtiLaunchDataForTasks(result);
            return result;
        }

        public async Task DeleteHomeworkAsync(long homeworkId)
        {
            await _homeworksRepository.DeleteAsync(homeworkId);
        }

        public async Task<HomeworkViewModel> UpdateHomeworkAsync(long homeworkId, CreateHomeworkViewModel homeworkViewModel)
        {
            homeworkViewModel.Tags = homeworkViewModel.Tags.Where(t => !string.IsNullOrWhiteSpace(t)).ToList();
            var update = homeworkViewModel.ToHomework();
            var options = homeworkViewModel.ActionOptions ?? ActionOptions.Default;

            var homework = await _homeworksRepository.GetAsync(homeworkId);
            var course = await _coursesRepository.GetWithCourseMates(homework.CourseId);
            var studentIds = course!.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();

            if (options.SendNotification && update.PublicationDate <= DateTime.UtcNow)
                _eventBus.Publish(new UpdateHomeworkEvent(update.Title, course.Id, course.Name, studentIds));

            await _homeworksRepository.UpdateAsync(homeworkId, hw => new Homework()
            {
                Title = update.Title,
                Description = update.Description,
                HasDeadline = update.HasDeadline,
                DeadlineDate = update.DeadlineDate,
                PublicationDate = update.PublicationDate,
                IsDeadlineStrict = update.IsDeadlineStrict,
                Tags = update.Tags
            });

            var updatedHomework = await _homeworksRepository.GetWithTasksAsync(homeworkId);
            CourseDomain.FillTasksInHomework(updatedHomework);

            var updatedHomeworkViewModel = updatedHomework.ToHomeworkViewModel();
            await _tasksService.FillLtiLaunchDataForTasks(updatedHomeworkViewModel);

            return updatedHomeworkViewModel;
        }
    }
}
