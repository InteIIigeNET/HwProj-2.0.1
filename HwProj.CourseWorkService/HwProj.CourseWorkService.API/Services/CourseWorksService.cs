using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CourseWorkService.API.Exceptions;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services
{
    public class CourseWorksService : ICourseWorksService
    {
        #region Fields: Private

        private readonly ICourseWorksRepository _courseWorksRepository;
        private readonly IDeadlineRepository _deadlineRepository;
        private readonly IUsersRepository _usersRepository;
        private readonly IMapper _mapper;

        #endregion

        #region Constructors: Public

        public CourseWorksService(ICourseWorksRepository courseWorkRepository,
            IDeadlineRepository deadlineRepository, IUsersRepository usersRepository, IMapper mapper)
        {
            _courseWorksRepository = courseWorkRepository;
            _deadlineRepository = deadlineRepository;
            _usersRepository = usersRepository;
            _mapper = mapper;
        }

        #endregion

        #region Methods: Private

        private async Task<CourseWork> GetCourseWorkByIdAsync(long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId).ConfigureAwait(false);
            return courseWork ??
                   throw new ObjectDisposedException($"Course work with id {courseWorkId}");
        }

        [SuppressMessage("ReSharper", "ParameterOnlyUsedForPreconditionCheck.Local")]
        private static void CheckCourseWorkLecturer(CourseWork courseWork, string userId)
        {
            if (courseWork.LecturerId != userId) throw new ForbidException("Only an owner of the course work can delete it");
        }

        private async Task<OverviewCourseWorkDTO> GetCourseWorkOverviewDTO(CourseWork courseWork)
        {
            var courseWorkDTO = _mapper.Map<OverviewCourseWorkDTO>(courseWork);

            var student = await _usersRepository.GetAsync(courseWork.StudentId).ConfigureAwait(false);
            courseWorkDTO.StudentName = student?.UserName ?? "";

            return courseWorkDTO;
        }

        private async Task<DetailCourseWorkDTO> GetCourseWorkDetailDTO(CourseWork courseWork)
        {
            var detailCourseWorkDTO = _mapper.Map<DetailCourseWorkDTO>(courseWork);
            var reviewer = await _usersRepository.GetAsync(courseWork.ReviewerId).ConfigureAwait(false);
            var student = await _usersRepository.GetUserAsync(courseWork.StudentId).ConfigureAwait(false);

            detailCourseWorkDTO.ReviewerName = reviewer?.UserName ?? "";
            detailCourseWorkDTO.StudentName = student?.UserName ?? "";
            detailCourseWorkDTO.StudentCourse = student?.StudentProfile.Course ?? 0;
            return detailCourseWorkDTO;
        }

        #endregion

        #region Methods: Public

        public async Task<OverviewCourseWorkDTO[]> GetFilteredCourseWorksAsync(Func<CourseWork, bool> predicate)
        {
            var courseWorks = await _courseWorksRepository
                .FindAll(courseWork => predicate(courseWork))
                .ToArrayAsync()
                .ConfigureAwait(false);

            return await Task.WhenAll(courseWorks
                .Select(async courseWork => await GetCourseWorkOverviewDTO(courseWork).ConfigureAwait(false))
                .ToArray());
        }

        public async Task<DetailCourseWorkDTO> GetCourseWorkInfoAsync(long courseWorkId)
        {
            var courseWork = await GetCourseWorkByIdAsync(courseWorkId).ConfigureAwait(false);
            return await GetCourseWorkDetailDTO(courseWork).ConfigureAwait(false);
        }

        public async Task<long> AddCourseWorkAsync(CreateCourseWorkViewModel createCourseWorkViewModel, 
            string userId, bool createdByCurator)
        {
            var courseWork = _mapper.Map<CourseWork>(createCourseWorkViewModel);
            if (createdByCurator)
            {
                courseWork.CreatedByCurator = true;
            }
            else
            {
                var user = await _usersRepository.GetUserAsync(userId).ConfigureAwait(false);
                courseWork.SupervisorName = user.UserName;
                courseWork.SupervisorContact = courseWork.SupervisorContact ?? user.LecturerProfile.Contact;
            }

            courseWork.CreationTime = DateTime.UtcNow;
            courseWork.LecturerId = userId;

            return await _courseWorksRepository.AddAsync(courseWork).ConfigureAwait(false);
        }

        public async Task DeleteCourseWorkAsync(long courseWorkId, string userId)
        {
            var courseWork = await GetCourseWorkByIdAsync(courseWorkId).ConfigureAwait(false);
            CheckCourseWorkLecturer(courseWork, userId);

            await _courseWorksRepository.DeleteAsync(courseWorkId).ConfigureAwait(false);
        }

        public async Task UpdateCourseWorkAsync(long courseWorkId, string userId,
            CreateCourseWorkViewModel createCourseWorkViewModel)
        {
            var courseWork = await GetCourseWorkByIdAsync(courseWorkId).ConfigureAwait(false);
            CheckCourseWorkLecturer(courseWork, userId);

            await _courseWorksRepository.UpdateAsync(courseWorkId, cw => new CourseWork()
                {
                    Title = createCourseWorkViewModel.Title,
                    Overview = createCourseWorkViewModel.Overview,
                    Description = createCourseWorkViewModel.Description,
                    Type = createCourseWorkViewModel.Type,
                    Requirements = createCourseWorkViewModel.Requirements,
                    ConsultantName = createCourseWorkViewModel.ConsultantName,
                    ConsultantContact = createCourseWorkViewModel.ConsultantContact,
                    SupervisorContact = createCourseWorkViewModel.SupervisorContact
                })
                .ConfigureAwait(false);
        }

        #endregion

        public DeadlineDTO[] GetCourseWorkDeadlines(string userId, CourseWork courseWork)
        {
            IEnumerable<Deadline> deadlines;
            if (userId == courseWork.StudentId)
            {
                deadlines = courseWork.Deadlines.Where(deadline => deadline.Type == "Student");
            }
            else if (userId == courseWork.ReviewerId)
            {
                deadlines = courseWork.Deadlines.Where(deadline => deadline.Type == "Reviewer");
            }
            else if (userId == courseWork.LecturerId || userId == courseWork.CuratorId)
            {
                deadlines = courseWork.Deadlines;
            }
            else
            {
                deadlines = courseWork.Deadlines.Where(deadline => deadline.Type == "Bidding");
            }

            var deadlinesArray = deadlines.ToArray();
            var deadlinesDTO = _mapper.Map<DeadlineDTO[]>(deadlinesArray);

            return deadlinesDTO;
        }

        public async Task<long> AddDeadlineAsync(AddDeadlineViewModel newDeadline, CourseWork courseWork)
        {
            var deadline = _mapper.Map<Deadline>(newDeadline);
            deadline.CourseWorkId = courseWork.Id;
            return await _deadlineRepository.AddAsync(deadline).ConfigureAwait(false);
        }

        public WorkFileDTO[] GetWorkFilesDTO(WorkFile[] workFiles)
        {
            var workFilesDTO = _mapper.Map<WorkFileDTO[]>(workFiles);
            return workFilesDTO;
        }
    }
}
