using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.DTO;
using HwProj.CoursesService.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class GroupsService : IGroupsService
    {
        private readonly IGroupsRepository _groupsRepository;
        private readonly IGroupMatesRepository _groupMatesRepository;
        private readonly IMapper _mapper;
        private CourseContext _courseContext;

        public GroupsService(IGroupsRepository groupsRepository,
            IGroupMatesRepository groupMatesRepository,
            CourseContext courseContext,
            IMapper mapper)
        {
            _courseContext = courseContext;
            _groupsRepository = groupsRepository;
            _groupMatesRepository = groupMatesRepository;
            _mapper = mapper;
        }

        public async Task<Group[]> GetAllAsync(long courseId)
        {
            return await _groupsRepository.GetAllInCourseWithGroupMates(courseId).ToArrayAsync().ConfigureAwait(false);
        }

        public async Task<Group> GetGroupAsync(long groupId)
        {
            return await _groupsRepository.GetGroupWithGroupMatesAsync(groupId).ConfigureAwait(false);
        }

        public async Task<long> AddGroupAsync(Group group, long courseId)
        {
            group.CourseId = courseId;
            var mates = group.GroupMates;
            group.GroupMates = null;
            var groupId = await _groupsRepository.AddAsync(group).ConfigureAwait(false);

            mates.ForEach(cm => cm.GroupId = groupId);
            _courseContext.AddRange(mates);
            _courseContext.SaveChanges();

            return groupId;
        }

        public async Task<bool> AddGroupMateAsync(long groupId, string studentId)
        {
            var getGroupTask = _groupsRepository.GetAsync(groupId);
            var getGroupMateTask =
                _groupMatesRepository.FindAsync(cm => cm.GroupId == groupId && cm.StudentId == studentId);
            await Task.WhenAll(getGroupTask, getGroupMateTask);

            if (getGroupTask.Result == null || getGroupMateTask.Result != null)
            {
                return false;
            }


            var groupMate = new GroupMate
            {
                GroupId = groupId,
                StudentId = studentId,
            };

            await _groupMatesRepository.AddAsync(groupMate);
            return true;
        }

        public async Task DeleteGroupAsync(long groupId)
        {
            await _groupsRepository.DeleteAsync(groupId);
        }

        public async Task UpdateAsync(long groupId, Group updated)
        {
            await _groupsRepository.UpdateAsync(groupId, c => new Group
            {
                Name = updated.Name
            }).ConfigureAwait(false);
        }

        public async Task<bool> DeleteCourseMateFromGroupAsync(long groupId, string studentId)
        {
            var getGroupTask = await _groupsRepository.GetAsync(groupId).ConfigureAwait(false);
            if (getGroupTask == null)
            {
                return false;
            }

            var getGroupMateTask =
                await _groupMatesRepository.FindAsync(cm => cm.GroupId == groupId && cm.StudentId == studentId).ConfigureAwait(false);

            if (getGroupMateTask == null)
            {
                return false;
            }


            await _groupMatesRepository.DeleteAsync(getGroupMateTask.Id).ConfigureAwait(false);
            return true;
        }

        public async Task<UserGroupDescription[]> GetCourseMateGroupsAsync(long courseId, string studentId)
        {
            var studentGroupsIds = await _groupMatesRepository
                .FindAll(cm => cm.StudentId == studentId)
                .Select(cm => cm.GroupId)
                .ToArrayAsync()
                .ConfigureAwait(false);

            var getStudentGroupsTask = studentGroupsIds
                .Select(async id => await _groupsRepository.GetAsync(id).ConfigureAwait(false))
                .Where(cm => cm.Result.CourseId == courseId)
                .ToArray();

            return getStudentGroupsTask.Select(c =>
            {
                var userGroupDescription = _mapper.Map<UserGroupDescription>(c);
                return userGroupDescription;
            }).ToArray();
        }
    }
}