using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Exceptions;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services.Implementations
{
    public class UniversityService : IUniversityService
    {
        #region Fields: Private

        private readonly IViewModelService _viewModelService;
        private readonly ICourseWorksRepository _courseWorksRepository;
        private readonly IDeadlineRepository _deadlineRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IDirectionRepository _directionRepository;
        private readonly IUsersRepository _usersRepository;

        #endregion

        #region Constructors: Public

        public UniversityService(ICourseWorksRepository courseWorksRepository, IDeadlineRepository deadlineRepository,
	        IDepartmentRepository departmentRepository, IDirectionRepository directionRepository,
	        IUsersRepository usersRepository, IViewModelService viewModelService)
        {
	        _courseWorksRepository = courseWorksRepository;
	        _deadlineRepository = deadlineRepository;
            _departmentRepository = departmentRepository;
            _directionRepository = directionRepository;
            _usersRepository = usersRepository;
            _viewModelService = viewModelService;
        }

        #endregion

        #region Methods: Private

        private async Task RemoveExistDeadlineAsync(Deadline deadline)
        {
	        var deadlines = await _deadlineRepository.FindAll(d =>
			        d.CuratorProfileId == deadline.CuratorProfileId
			        && d.DeadlineTypeId == deadline.DeadlineTypeId
			        && d.CourseWorkId == deadline.CourseWorkId)
		        .ToArrayAsync()
		        .ConfigureAwait(false);
	        if (deadline.DeadlineTypeId == (long) DeadlineTypes.ChoiceTheme)
	        {
		        deadlines = deadlines
			        .Where(d => d.DirectionId == deadline.DirectionId && d.Course == deadline.Course)
			        .ToArray();
	        }

	        if (deadline.DeadlineTypeId == (long) DeadlineTypes.Corrections)
	        {
		        var textDeadlines = await _deadlineRepository.FindAll(d =>
				        d.CuratorProfileId == deadline.CuratorProfileId
				        && d.CourseWorkId == deadline.CourseWorkId
				        && d.DeadlineTypeId == (long) DeadlineTypes.CourseWorkText)
			        .ToArrayAsync()
			        .ConfigureAwait(false);

		        var newDeadlines = deadlines.ToList();
                newDeadlines.AddRange(textDeadlines);
                deadlines = newDeadlines.ToArray();
	        }
            foreach (var oldDeadline in deadlines)
            {
	            await DeleteDeadlineAsync(oldDeadline.CuratorProfileId, oldDeadline.Id).ConfigureAwait(false);
            }
        }

        private async Task<bool> CheckCourseWorkAsync(string userId)
        {
	        var courseWorks = await _courseWorksRepository
		        .FindAll(cw => cw.StudentProfileId == userId && cw.IsCompleted == false)
		        .ToArrayAsync()
		        .ConfigureAwait(false);
	        return courseWorks.Length > 0;
        }

        private async Task<Deadline[]> GetCustomCourseWorkDeadlinesAsync(CourseWork courseWork, DeadlineTypes[] types)
        {
            var allDeadlines = await GetAllVisibleCourseWorkDeadlinesAsync(courseWork).ConfigureAwait(false);
            return allDeadlines
	            .Where(d => types.Contains((DeadlineTypes)d.DeadlineTypeId))
	            .ToArray();
        }

        private async Task<Deadline[]> GetAllVisibleCourseWorkDeadlinesAsync(CourseWork courseWork)
        {
	        var curatorDeadlines = await GetAllCourseWorkDeadlineForCurator(courseWork).ConfigureAwait(false);

	        return Enum.GetValues(typeof(DeadlineTypes))
		        .OfType<DeadlineTypes>()
		        .Where(dt => dt != DeadlineTypes.ChoiceTheme)
		        .Select(deadlineType =>
			        curatorDeadlines.FirstOrDefault(d =>
				        d.DeadlineTypeId == (long) deadlineType && d.CourseWorkId == courseWork.Id)
			        ?? curatorDeadlines.FirstOrDefault(d =>
				        d.DeadlineTypeId == (long) deadlineType && d.CourseWorkId == null))
		        .Where(deadline => deadline != null && CheckVisibleDeadline(deadline, courseWork))
		        .ToArray();
        }

        private async Task<Deadline[]> GetAllCourseWorkDeadlineForCurator(CourseWork courseWork)
        {
            return await _deadlineRepository
	            .FindAllDeadlines(d =>
		            d.CuratorProfileId == courseWork.CuratorProfileId
		            && (d.CourseWorkId == courseWork.Id || d.CourseWorkId == null))
	            .ConfigureAwait(false);
        }

        private static bool CheckVisibleDeadline(Deadline deadline, CourseWork courseWork)
        {
	        switch (deadline.DeadlineTypeId)
	        {
		        case (long)DeadlineTypes.Bidding:
		        case (long)DeadlineTypes.Reviewing:
		        case (long)DeadlineTypes.Protection:
			        return deadline.Date >= DateTime.Now;
		        case (long) DeadlineTypes.CourseWorkText:
		        case (long) DeadlineTypes.Corrections:
			        return !courseWork.IsUpdated;
                default: return false;
	        }
        }

        #endregion

        #region Methods: Public

        public async Task<DirectionDTO[]> GetDirectionsAsync()
        {
            var directions = await _directionRepository.GetDirectionsAsync().ConfigureAwait(false);
            return directions.Select(_viewModelService.GetDirectionDTO).ToArray();
        }
        public async Task<long> AddDirectionAsync(AddDirectionViewModel directionViewModel)
        {
            var direction = _viewModelService.GetDirectionFromViewModel(directionViewModel);
            return await _directionRepository.AddAsync(direction).ConfigureAwait(false);
        }
        public async Task DeleteDirectionAsync(long directionId)
        {
            await _directionRepository.DeleteAsync(directionId).ConfigureAwait(false);
        }

        public async Task<DepartmentDTO[]> GetDepartmentsAsync()
        {
            var departments = await _departmentRepository.GetAll().ToArrayAsync().ConfigureAwait(false);
            return departments.Select(_viewModelService.GetDepartmentDTO).ToArray();
        }
        public async Task<long> AddDepartmentAsync(AddDepartmentViewModel departmentViewModel)
        {
            var department = _viewModelService.GetDepartmentFromViewModel(departmentViewModel);
            return await _departmentRepository.AddAsync(department).ConfigureAwait(false);
        }
        public async Task DeleteDepartmentAsync(long departmentId)
        {
            await _departmentRepository.DeleteAsync(departmentId).ConfigureAwait(false);
        }

        public async Task<DeadlineDTO[]> GetCuratorDeadlines(string userId)
        {
	        var deadlines = await _deadlineRepository
		        .FindAllDeadlines(d => d.CuratorProfileId == userId)
		        .ConfigureAwait(false);
	        return deadlines.Select(_viewModelService.GetDeadlineDTO).ToArray();
        }
        public async Task<DeadlineDTO> GetChoiceThemeDeadlineAsync(string userId)
        {
	        var user = await _usersRepository.GetUserAsync(userId).ConfigureAwait(false);
	        var deadlines = await _deadlineRepository
		        .FindAllDeadlines(d =>
			        d.DirectionId == user.StudentProfile.DirectionId
			        && d.Course == user.StudentProfile.Course
			        && d.DeadlineTypeId == (long) DeadlineTypes.ChoiceTheme)
		        .ConfigureAwait(false);
	        var deadline = deadlines.FirstOrDefault();
	        var chosenCourseWork = await CheckCourseWorkAsync(userId);
	        return deadline == null || chosenCourseWork ? null : _viewModelService.GetDeadlineDTO(deadline);
        }
        public async Task<DeadlineDTO[]> GetCourseWorkDeadlinesAsync(string userId, long courseWorkId)
        {
	        var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId).ConfigureAwait(false);
            if (courseWork == null) throw new ObjectNotFoundException($"Course work with id {courseWorkId} not found!");

            var deadlines = new List<Deadline>();
            if (courseWork.StudentProfileId == userId)
            {
	            var studentDeadlines = await GetCustomCourseWorkDeadlinesAsync(courseWork, new []
	            {
		            DeadlineTypes.CourseWorkText,
		            DeadlineTypes.Corrections, 
		            DeadlineTypes.Protection
	            }).ConfigureAwait(false);
                deadlines.AddRange(studentDeadlines);
            }
            else if (courseWork.ReviewerProfileId == userId)
            {
	            var reviewerDeadlines = await GetCustomCourseWorkDeadlinesAsync(courseWork, new[]
	            {
		            DeadlineTypes.Reviewing
	            }).ConfigureAwait(false);
                deadlines.AddRange(reviewerDeadlines);
            }
            else if (courseWork.CuratorProfile?.ReviewersInCuratorsBidding
	            .Any(e => e.ReviewerProfileId == userId) ?? false)
            {
	            var reviewerDeadlines = await GetCustomCourseWorkDeadlinesAsync(courseWork, new[]
	            {
		            DeadlineTypes.Bidding
	            }).ConfigureAwait(false);
	            deadlines.AddRange(reviewerDeadlines);
            }
            else if (courseWork.LecturerProfileId == userId || courseWork.CuratorProfileId == userId)
            {
	            var curatorDeadlines = await GetAllCourseWorkDeadlineForCurator(courseWork).ConfigureAwait(false);
	            deadlines.AddRange(curatorDeadlines);
            }

            return deadlines.Select(_viewModelService.GetDeadlineDTO).ToArray();
        }
        public async Task<long> AddDeadlineAsync(string userId, AddDeadlineViewModel addDeadlineViewModel)
        {
	        var deadline = _viewModelService.GetDeadlineFromViewModel(addDeadlineViewModel, userId);
	        await RemoveExistDeadlineAsync(deadline).ConfigureAwait(false);
	        if (deadline.DeadlineTypeId == (long) DeadlineTypes.CourseWorkText ||
	            deadline.DeadlineTypeId == (long) DeadlineTypes.Corrections)
	        {
		        await _courseWorksRepository.ClearIsUpdatedInCourseWorksByCuratorAsync(userId).ConfigureAwait(false);
            }
	        return await _deadlineRepository.AddAsync(deadline).ConfigureAwait(false);
        }
        public async Task DeleteDeadlineAsync(string userId, long deadlineId)
        {
	        var deadline = await _deadlineRepository.GetAsync(deadlineId).ConfigureAwait(false);
            if (deadline == null) return;
	        if (deadline.CuratorProfileId != userId)
	        {
                throw new ForbidException("You have not rights to this action!");
	        }

	        await _deadlineRepository.DeleteAsync(deadlineId).ConfigureAwait(false);
        }

        #endregion
    }
}
