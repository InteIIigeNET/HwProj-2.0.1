using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.SolutionsService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.NotificationsService.API.Services.Digest;
using HwProj.NotificationsService.API.Services.Messages;

namespace HwProj.NotificationsService.API.EventHandlers
{
    /// <summary> Новые решения не попадают в ленту уведомлений: преподаватели узнают о них из дайжеста </summary>
    public class StudentPassTaskEventHandler : IEventHandler<StudentPassTaskEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationSettingsService _settingsService;

        public StudentPassTaskEventHandler(
            INotificationsRepository notificationRepository,
            INotificationSettingsService settingsService)
        {
            _notificationRepository = notificationRepository;
            _settingsService = settingsService;
        }

        public async Task HandleAsync(StudentPassTaskEvent @event)
        {
            var digest = new DigestItem
            {
                Kind = DigestItemKind.NewSolution,
                CourseId = @event.Course.Id,
                CourseName = @event.Course.Name,
                TaskId = @event.Task.Id,
                TaskTitle = @event.Task.Title,
                StudentId = @event.Solution.StudentId,
                StudentName = NotificationHtml.FullName(@event.Student.Name, @event.Student.Surname)
            };

            foreach (var mentorId in @event.Course.MentorIds)
            {
                var setting = await _settingsService.GetAsync(mentorId,
                    NotificationsSettingCategory.NewSolutionsCategory);
                if (!setting.IsEnabled) continue;

                await _notificationRepository.AddAsync(
                    digest.ToDigestOnlyNotification(mentorId, "SolutionService", CategoryState.Homeworks));
            }
        }
    }
}
