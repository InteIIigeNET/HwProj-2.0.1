using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.API.Repositories;
using Microsoft.EntityFrameworkCore;


namespace HwProj.SolutionsService.API.Services
{
    public class SolutionsService : ISolutionsService
    {
        private readonly ISolutionsRepository _solutionsRepository;
        private readonly IEventBus _eventBus;
        private readonly IMapper _mapper;
        private readonly ICoursesServiceClient _coursesServiceClient;
        public SolutionsService(ISolutionsRepository solutionsRepository, IEventBus eventBus, IMapper mapper, ICoursesServiceClient coursesServiceClient)
        {
            _solutionsRepository = solutionsRepository;
            _coursesServiceClient = coursesServiceClient;
            _eventBus = eventBus;
            _mapper = mapper;
            _coursesServiceClient = coursesServiceClient;
        }

        public async Task<Solution[]> GetAllSolutionsAsync()
        {
            return await _solutionsRepository.GetAll().ToArrayAsync();
        }

        public Task<Solution> GetSolutionAsync(long solutionId)
        {
            return _solutionsRepository.GetAsync(solutionId);
        }

        public async Task<Solution[]> GetTaskSolutionsFromStudentAsync(long taskId, string studentId)
        {
            return await _solutionsRepository
                .FindAll(solution => solution.TaskId == taskId && solution.StudentId == studentId)
                .ToArrayAsync();
        }

        public async Task<long> AddSolutionAsync(long taskId, Solution solution)
        {
            solution.TaskId = taskId;
            solution.PublicationDate = DateTime.Now;
            var id = await _solutionsRepository.AddAsync(solution);

            var solutionModel = _mapper.Map<SolutionViewModel>(solution);
            var task = await _coursesServiceClient.GetTask(solution.TaskId);
            var taskModel = _mapper.Map<HomeworkTaskViewModel>(task);
            var homework = await _coursesServiceClient.GetHomework(taskModel.HomeworkId);
            var homeworkModel = _mapper.Map<HomeworkViewModel>(homework);
            var courses = await _coursesServiceClient.GetCourseById(homeworkModel.CourseId, solution.StudentId);
            _eventBus.Publish(new StudentPassTaskEvent(courses, solutionModel));
            _eventBus.Publish(new RequestMaxRatingEvent(taskId, id));

            return id;
        }

        public async Task RateSolutionAsync(long solutionId, int newRating, string lecturerComment)
        {
            var solution = await _solutionsRepository.GetAsync(solutionId);
            SolutionState state;
            if (solution.MaxRating < newRating)
                state = SolutionState.Overrated;
            else if (solution.MaxRating == newRating)
                state = SolutionState.Final;
            else state = SolutionState.Rated;

            var solutionModel = _mapper.Map<SolutionViewModel>(solution);
            var task = await _coursesServiceClient.GetTask(solution.TaskId);
            var taskModel = _mapper.Map<HomeworkTaskViewModel>(task);
            _eventBus.Publish(new RateEvent(taskModel, solutionModel));

            await _solutionsRepository.RateSolutionAsync(solutionId, state, newRating);
        }

        public Task DeleteSolutionAsync(long solutionId)
        {
            return _solutionsRepository.DeleteAsync(solutionId);
        }

        public async Task MarkSolutionFinal(long solutionId)
        {
            await _solutionsRepository.UpdateSolutionState(solutionId, SolutionState.Final);
        }

        public Task<Solution[]> GetTaskSolutionsFromGroupAsync(long taskId, long groupId)
        {
            return _solutionsRepository.FindAll(cm => cm.GroupId == groupId).ToArrayAsync();
        }
    }
}
