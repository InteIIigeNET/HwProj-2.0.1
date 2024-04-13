using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Domains;

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

        public async Task<long> AddHomeworkAsync(long courseId, Homework homework)
        {
            homework.CourseId = courseId;

            var course = await _coursesRepository.GetWithCourseMatesAsync(courseId);
            var studentIds = course.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();
            if (DateTime.UtcNow >= homework.PublicationDate)
            {
                _eventBus.Publish(new NewHomeworkEvent(homework.Title, course.Name, course.Id, studentIds,
                    homework.DeadlineDate));
            }

            return await _homeworksRepository.AddAsync(homework);
        }

        public async Task<Homework> GetHomeworkAsync(long homeworkId)
        {
            var homework = await _homeworksRepository.GetWithTasksAsync(homeworkId);

            CourseDomain.FillTasksInHomework(homework);

            return homework;
        }

        public async Task<Homework> GetForEditingHomeworkAsync(long homeworkId)
        {
            var result =  await _homeworksRepository.GetWithTasksAsync(homeworkId);
            return result;
        }

        public async Task DeleteHomeworkAsync(long homeworkId)
        {
            await _homeworksRepository.DeleteAsync(homeworkId);
        }

        public async Task UpdateHomeworkAsync(long homeworkId, Homework update)
        {
            var homework = await _homeworksRepository.GetAsync(homeworkId);
            var course = await _coursesRepository.GetWithCourseMatesAsync(homework.CourseId);

            var studentIds = course.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();

            if (update.PublicationDate <= DateTime.UtcNow)
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
        }
    }
}
