using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Services
{
    public class CourseFilterService : ICourseFilterService
    {
        private readonly ICourseFilterRepository _courseFilterRepository;
        private readonly IUserToCourseFilterRepository _userToCourseFilterRepository;

        public CourseFilterService(
            ICourseFilterRepository courseFilterRepository, 
            IUserToCourseFilterRepository userToCourseFilterRepository)
        {
            _courseFilterRepository = courseFilterRepository;
            _userToCourseFilterRepository = userToCourseFilterRepository;
        }
        
        public async Task<long> CreateOrUpdateExpertFilter(CreateCourseFilterViewModel courseFilterView)
        {
            var exitingUserToCurseFilter = 
                await _userToCourseFilterRepository.GetAsync(courseFilterView.UserId, courseFilterView.CourseId);
            if (exitingUserToCurseFilter != null)
            {
                var filter = CourseFilterUtils.CreateFilter(courseFilterView);
                var exitingFilter = await _courseFilterRepository.GetAsync(exitingUserToCurseFilter.CourseFilterId);
                await UpdateAsync(exitingFilter.Id, filter);
                return exitingFilter.Id;
            }
            else
            {
                var filter = CourseFilterUtils.CreateFilter(courseFilterView);
                var filterId = await _courseFilterRepository.AddAsync(new CourseFilter { Filter = filter });
                await AddUserToCourseFilterRecords(courseFilterView, filterId);
                return filterId;
            }
        }

        public async Task AddUserToCourseFilterRecords(CreateCourseFilterViewModel courseFilterView, long filterId)
        {
            var userToCourseFilter = new UserToCourseFilter
            {
                CourseFilterId = filterId,
                CourseId = courseFilterView.CourseId,
                UserId = courseFilterView.UserId
            };

            await _userToCourseFilterRepository.AddAsync(userToCourseFilter);
        }
        
        public async Task<Filter> GetUserCourseFilterAsync(string userId, long courseId)
        {
            var courseFilter = await _userToCourseFilterRepository.GetAsync(userId, courseId);
            return (await _courseFilterRepository.GetAsync(courseFilter.CourseFilterId)).Filter;
        }

        public async Task UpdateAsync(string userId, long courseId, Filter filter)
        {
            var courseFilter = await _userToCourseFilterRepository.GetAsync(userId, courseId);
            if (courseFilter == null)
            {
                return;
            }
            
            await UpdateAsync(courseFilter.CourseFilterId, filter);
        }

        public async Task UpdateAsync(long courseFilterId, Filter filter)
        {
            await _courseFilterRepository.UpdateAsync(courseFilterId, f =>
                new CourseFilter
                {
                    Filter = filter
                });
        }
    }
}