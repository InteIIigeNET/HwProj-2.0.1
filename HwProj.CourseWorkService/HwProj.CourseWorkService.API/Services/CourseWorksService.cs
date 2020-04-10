using System;
using System.Collections.Generic;
using System.Linq;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CourseWorkService.API.Models.DTO;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services
{
    public class CourseWorksService : ICourseWorksService
    {
        private readonly ICourseWorksRepository _courseWorksRepository;
        private readonly IMapper _mapper;

        public CourseWorksService(ICourseWorksRepository courseWorkRepository, IMapper mapper)
        {
            _courseWorksRepository = courseWorkRepository;
            _mapper = mapper;
        }

        public async Task<OverviewCourseWorkDTO[]> GetFilteredCourseWorksWithStatusAsync(string status, Func<CourseWork, bool> predicate)
        {
            if (status == "active")
            {
                return await GetActiveFilteredCourseWorksAsync(predicate).ConfigureAwait(false);
            }

            return await GetCompletedFilteredCourseWorksAsync(predicate).ConfigureAwait(false);
        }

        public async Task<OverviewCourseWorkDTO[]> GetActiveFilteredCourseWorksAsync(Func<CourseWork, bool> predicate)
        {
            var courseWorks = await _courseWorksRepository
                .FindAll(courseWork => predicate(courseWork) && !courseWork.IsCompleted)
                .ToArrayAsync().ConfigureAwait(false);
            return _mapper.Map<OverviewCourseWorkDTO[]>(courseWorks);
        }
        public async Task<OverviewCourseWorkDTO[]> GetCompletedFilteredCourseWorksAsync(Func<CourseWork, bool> predicate)
        {
            var courseWorks = await _courseWorksRepository
                .FindAll(courseWork => predicate(courseWork) && courseWork.IsCompleted)
                .ToArrayAsync().ConfigureAwait(false);
            return _mapper.Map<OverviewCourseWorkDTO[]>(courseWorks);
        }

        public DetailCourseWorkDTO GetCourseWorkInfo(CourseWork courseWork)
        {
            var detailCourseWork = _mapper.Map<DetailCourseWorkDTO>(courseWork);
            detailCourseWork.CreationTime = courseWork.CreationTime.ToString("MM/dd/yyyy");
            return detailCourseWork;
        }

        public DeadlineDTO[] GetCourseWorkDeadlines(string userId, CourseWork courseWork)
        {
            IEnumerable<Deadline> deadlines;
            if (userId == courseWork.StudentId)
            {
                deadlines = courseWork.Deadlines.Where(deadline => deadline.Role == "StudentProfile");
            }
            else if (userId == courseWork.ReviewerId)
            {
                deadlines = courseWork.Deadlines.Where(deadline => deadline.Role == "Reviewer");
            }
            else if (userId == courseWork.LecturerId || userId == courseWork.CuratorId)
            {
                deadlines = courseWork.Deadlines;
            }
            else
            {
                deadlines = courseWork.Deadlines.Where(deadline => deadline.Type == "Bidding");
            }

            return _mapper.Map<DeadlineDTO[]>(deadlines.ToArray());
        }
    }
}
