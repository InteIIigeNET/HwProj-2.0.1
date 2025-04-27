using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Domains;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Services
{
    public class HomeworksService : IHomeworksService
    {
        private readonly IHomeworksRepository _homeworksRepository;
        private readonly IEventBus _eventBus;
        private readonly ICoursesRepository _coursesRepository;

        public HomeworksService(IHomeworksRepository homeworksRepository, IEventBus eventBus,
            ICoursesRepository coursesRepository)
        {
            _homeworksRepository = homeworksRepository;
            _eventBus = eventBus;
            _coursesRepository = coursesRepository;
        }

        public async Task<Homework> AddHomeworkAsync(long courseId, Homework homework)
        {
            homework.CourseId = courseId;

            var course = await _coursesRepository.GetWithCourseMatesAndHomeworksAsync(courseId);
            var studentIds = course.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();
            if (DateTime.UtcNow >= homework.PublicationDate)
            {
                _eventBus.Publish(new NewHomeworkEvent(homework.Title, course.Name, course.Id, studentIds,
                    homework.DeadlineDate));
            }

            await _homeworksRepository.AddAsync(homework);
            return await GetHomeworkAsync(homework.Id);
        }

        public async Task<Homework> GetHomeworkAsync(long homeworkId)
        {
            var homework = await _homeworksRepository.GetWithTasksAsync(homeworkId);

            CourseDomain.FillTasksInHomework(homework);

            return homework;
        }

        public async Task<Homework> GetForEditingHomeworkAsync(long homeworkId)
        {
            var result = await _homeworksRepository.GetWithTasksAsync(homeworkId);
            return result;
        }

        public async Task DeleteHomeworkAsync(long homeworkId)
        {
            await _homeworksRepository.DeleteAsync(homeworkId);
        }

        public async Task<Homework> UpdateHomeworkAsync(long homeworkId, Homework update, ActionOptions options)
        {
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
            return updatedHomework;
        }
    }
}
