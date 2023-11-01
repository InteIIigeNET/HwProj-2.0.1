using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.CoursesService.API.Events;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.CoursesService.API.Domains;
using HwProj.Models;

namespace HwProj.CoursesService.API.Services
{
    public class HomeworksService : IHomeworksService
    {
        private readonly IHomeworksRepository _homeworksRepository;
        private readonly IEventBus _eventBus;
        private readonly IMapper _mapper;
        private readonly ICoursesRepository _coursesRepository;
        public HomeworksService(IHomeworksRepository homeworksRepository, IEventBus eventBus, IMapper mapper, ICoursesRepository coursesRepository)
        {
            _homeworksRepository = homeworksRepository;
            _eventBus = eventBus;
            _mapper = mapper;
            _coursesRepository = coursesRepository;
        }
        
        public async Task<long> AddHomeworkAsync(long courseId, Homework homework)
        {
            homework.CourseId = courseId;

            var course = await _coursesRepository.GetWithCourseMatesAsync(courseId);
            var courseModel = _mapper.Map<CourseDTO>(course);
            var studentIds = courseModel.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();

            if (DateTimeUtils.GetMoscowNow() >= homework.PublicationDate)
            {
                _eventBus.Publish(new NewHomeworkEvent(homework.Title, courseModel.Name, courseModel.Id, studentIds,
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
            return await _homeworksRepository.GetWithTasksAsync(homeworkId);
        }

        public async Task DeleteHomeworkAsync(long homeworkId)
        {
            await _homeworksRepository.DeleteAsync(homeworkId);
        }

        public async Task UpdateHomeworkAsync(long homeworkId, Homework update)
        {
            var homework = await _homeworksRepository.GetWithTasksAsync(homeworkId);
            var course = await _coursesRepository.GetWithCourseMatesAsync(homework.CourseId);
            var courseModel = _mapper.Map<CourseDTO>(course);   
            var studentIds = courseModel.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();

            if (update.PublicationDate <= DateTimeUtils.GetMoscowNow())
            {
                _eventBus.Publish(new UpdateHomeworkEvent(update.Title, courseModel.Id, courseModel.Name, studentIds));
            }

            await _homeworksRepository.UpdateAsync(homeworkId, hw => new Homework()
            {
                Title = update.Title,
                Description = update.Description,
                HasDeadline = update.HasDeadline,
                DeadlineDate = update.DeadlineDate,
                PublicationDate = update.PublicationDate,
                IsDeadlineStrict = update.IsDeadlineStrict,

            });
        }
    }
}
