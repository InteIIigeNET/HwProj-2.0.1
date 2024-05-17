using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;

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
        
        public async Task<Result<long>> CreateOrUpdateExpertFilter(CreateCourseFilterViewModel courseFilterView)
        {
            var exitingUserToCurseFilter = 
                await _userToCourseFilterRepository.GetAsync(courseFilterView.UserId, courseFilterView.CourseId);
            if (exitingUserToCurseFilter != null)
            {
                var areViewInvalid = courseFilterView.IsFilterParametersEmpty();
                if (areViewInvalid)
                {
                    return Result<long>.Failed("Необходимо выделить эксперту хотя бы одного студента и домашню работу");
                }
                
                var filter = CourseFilterUtils.CreateFilter(courseFilterView);
                var exitingFilter = await _courseFilterRepository.GetAsync(exitingUserToCurseFilter.CourseFilterId);
                await UpdateAsync(exitingFilter.Id, filter);
                return Result<long>.Success(exitingFilter.Id);
            }
            else
            {
                var filter = CourseFilterUtils.CreateFilter(courseFilterView);
                var filterId = await _courseFilterRepository.AddAsync(new CourseFilter { Filter = filter });
                await AddUserToCourseFilterRecords(courseFilterView, filterId);
                return Result<long>.Success(filterId);
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
        
        public async Task<Filter?> GetUserFilterAsync(string userId, long courseId)
        {
            var userToCourseFilter = await _userToCourseFilterRepository.GetAsync(userId, courseId);
            if (userToCourseFilter == null)
            {
                return null;
            }

            var courseFilter = await _courseFilterRepository.GetAsync(userToCourseFilter.CourseFilterId);
            return courseFilter == null ? null : courseFilter.Filter;
        }

        public async Task UpdateAsync(string userId, long courseId, Filter filter)
        {
            var userToCourseFilter = await _userToCourseFilterRepository.GetAsync(userId, courseId);
            if (userToCourseFilter == null)
            {
                return;
            }
            
            await UpdateAsync(userToCourseFilter.CourseFilterId, filter);
        }

        public async Task UpdateAsync(long courseFilterId, Filter filter)
        {
            var courseFilter = new CourseFilter
            {
                Id = courseFilterId,
                Filter = filter
            };
            
            await _courseFilterRepository.UpdateAsync(courseFilterId, f =>
                new CourseFilter
                {
                    FilterJson = courseFilter.FilterJson
                });
        }

        public IQueryable<long> GetExpertCourseIds(string userId)
        {
            return _userToCourseFilterRepository
                .FindAll(ucf => ucf.UserId == userId)
                .Select(ucf => ucf.CourseId);
        }
    }
}