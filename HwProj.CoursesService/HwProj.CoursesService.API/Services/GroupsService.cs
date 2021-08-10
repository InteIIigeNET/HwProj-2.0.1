using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories.Groups;
using HwProj.Models.CoursesService.DTO;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class GroupsService : IGroupsService
    {
        private readonly IGroupsRepository _groupsRepository;
        private readonly IGroupMatesRepository _groupMatesRepository;
        private readonly ITaskModelsRepository _taskModelsRepository;
        private readonly IMapper _mapper;

        public GroupsService(IGroupsRepository groupsRepository,
            IGroupMatesRepository groupMatesRepository,
            ITaskModelsRepository taskModelsRepository,
            IMapper mapper)
        {
            _groupsRepository = groupsRepository;
            _groupMatesRepository = groupMatesRepository;
            _taskModelsRepository = taskModelsRepository;
            _mapper = mapper;
        }

        public async Task<Group[]> GetAllAsync(long courseId)
        {
            return await _groupsRepository.GetGroupsWithGroupMatesByCourse(courseId).ToArrayAsync().ConfigureAwait(false);
        }

        public async Task<Group> GetGroupAsync(long groupId)
        {
            return await _groupsRepository.GetGroupWithGroupMatesAsync(groupId).ConfigureAwait(false);
        }

        public async Task<long> AddGroupAsync(Group group)
        { 
            return await _groupsRepository.AddAsync(group).ConfigureAwait(false);
        }

        public async Task AddGroupMateAsync(long groupId, string studentId)
        {
            var groupMate = new GroupMate
            {
                GroupId = groupId,
                StudentId = studentId,
            };

            await _groupMatesRepository.AddAsync(groupMate).ConfigureAwait(false);
        }

        public async Task DeleteGroupAsync(long groupId)
        {
            var group = await _groupsRepository.GetAsync(groupId);
            group.GroupMates.RemoveAll(cm => true);
            group.Tasks.RemoveAll(cm => true);

            await _groupsRepository.DeleteAsync(groupId).ConfigureAwait(false);
        }

        public async Task UpdateAsync(long groupId, Group updated)
        {
            var group = await _groupsRepository.GetAsync(groupId);
            group.GroupMates.RemoveAll(cm => true);
            group.Tasks.RemoveAll(cm => true);

            updated.GroupMates.ForEach(cm => cm.GroupId = groupId);
            updated.Tasks.ForEach(cm => cm.GroupId = groupId);
            var mateTasks = updated.GroupMates.Select(cm => _groupMatesRepository.AddAsync(cm));
            var idTasks = updated.Tasks.Select(cm => _taskModelsRepository.AddAsync(cm));

            group.Name = updated.Name;

            await Task.WhenAll(mateTasks);
            await Task.WhenAll(idTasks);
        }

        public async Task<bool> DeleteGroupMateAsync(long groupId, string studentId)
        {
            var group = await _groupsRepository.GetAsync(groupId).ConfigureAwait(false);
            if (group == null)
            {
                return false;
            }

            var getGroupMateTask =
                await _groupMatesRepository.FindAsync(cm => cm.GroupId == groupId && cm.StudentId == studentId).ConfigureAwait(false);

            if (getGroupMateTask == null)
            {
                return false;
            }


            await _groupMatesRepository.DeleteAsync(getGroupMateTask.Id);
            return true;
        }

        public async Task<UserGroupDescription[]> GetStudentGroupsAsync(long courseId, string studentId)
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
            var studentGroups = await Task.WhenAll(getStudentGroupsTask).ConfigureAwait(false);

            return studentGroups.Select(c => _mapper.Map<UserGroupDescription>(c)).ToArray();
        }

        public async Task<long[]> GetTasksIds(long groupId)
        {
            var group = await GetGroupAsync(groupId);
            return group.Tasks.Select(cm => cm.TaskId).ToArray();
        }
    }
}