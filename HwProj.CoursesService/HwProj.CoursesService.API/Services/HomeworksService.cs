using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.CoursesService.API.Events;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;

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
            homework.Date = DateTimeUtils.GetMoscowNow();

            var course = await _coursesRepository.GetWithCourseMatesAsync(courseId);
            var courseModel = _mapper.Map<CourseDTO>(course);
            _eventBus.Publish(new NewHomeworkEvent(homework.Title, courseModel));

            return await _homeworksRepository.AddAsync(homework);
        }

        public async Task<Homework> GetHomeworkAsync(long homeworkId)
        {
            return await _homeworksRepository.GetWithTasksAsync(homeworkId);
        }

        public async Task DeleteHomeworkAsync(long homeworkId)
        {
            await _homeworksRepository.DeleteAsync(homeworkId);
        }

        public async Task UpdateHomeworkAsync(long homeworkId, Homework update)
        {
            var homework = await _homeworksRepository.GetAsync(homeworkId);
            var course = await _coursesRepository.GetWithCourseMatesAsync(homework.CourseId);
            var courseModel = _mapper.Map<CourseDTO>(course);
            var homeworkModel = _mapper.Map<HomeworkViewModel>(homework);
            _eventBus.Publish(new UpdateHomeworkEvent(homeworkModel, courseModel));

            await _homeworksRepository.UpdateAsync(homeworkId, hw => new Homework()
            {
                Title = update.Title,
                Description = update.Description
            });
        }
    }
}
