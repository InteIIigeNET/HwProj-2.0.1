using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.DTO;
using HwProj.CoursesService.API.Repositories;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Services
{
    public class GroupsService : IGroupsService
    {
        private readonly IGroupsRepository _groupsRepository;
        private readonly ICoursesRepository _coursesRepository;
        private readonly ICourseMatesRepository _courseMatesRepository;
        private readonly IMapper _mapper;

        public GroupsService(IGroupsRepository groupsRepository,
            ICoursesRepository coursesRepository,
            ICourseMatesRepository courseMatesRepository,
            IMapper mapper)
        {
            _groupsRepository = groupsRepository;
            _coursesRepository = coursesRepository;
            _courseMatesRepository = courseMatesRepository;
            _mapper = mapper;
        }

        public async Task<long> AddAsync(Group group, long courseId)
        {
            group.CourseId = courseId;
            return await _groupsRepository.AddAsync(group);
        }

        public async Task<Group> GetAsync(long courseId)
        {
            return await _groupsRepository.GetAsync(courseId);
        }

        public async Task<bool> AddCourseMateInGroupAsync(long groupId, string studentId)
        {
            var getGroupTask = _groupsRepository.GetAsync(groupId);
            await getGroupTask;
            var courseId = getGroupTask.Result.GroupId;
            var getCourseMateTask =
                _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await getCourseMateTask;

            if (getGroupTask.Result == null || getCourseMateTask.Result == null)
            {
                return false;
            }

            if (getGroupTask.Result.GroupMates.Contains(getCourseMateTask.Result))
            {
                return false;
            }

            getGroupTask.Result.GroupMates.Add(getCourseMateTask.Result);
            return true;
        }
    }
}
