using System;
using System.Collections.Generic;
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
            return await _groupsRepository.GetGroupsWithGroupMatesByCourse(courseId)
                .AsNoTracking()
                .ToArrayAsync()
                .ConfigureAwait(false);
        }

        public async Task<Group[]> GetGroupsAsync(params long[] groupIds)
        {
            return await _groupsRepository.GetGroupsWithGroupMatesAsync(groupIds).ConfigureAwait(false);
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
            var group = (await _groupsRepository.GetGroupsWithGroupMatesAsync(new[] { groupId }))
                .FirstOrDefault() ?? throw new InvalidOperationException($"Group with id {groupId} not found");

            foreach (var groupMate in group.GroupMates.ToList())
            {
                await _groupMatesRepository.DeleteAsync(groupMate.Id);
            }

            foreach (var task in group.Tasks.ToList())
            {
                await _taskModelsRepository.DeleteAsync(task.Id);
            }

            updated.GroupMates?.ForEach(cm => cm.GroupId = groupId);
            updated.Tasks?.ForEach(cm => cm.GroupId = groupId);

            group.Name = updated.Name;

            if (updated.GroupMates != null && updated.GroupMates.Count > 0)
            {
                await _groupMatesRepository.AddRangeAsync(updated.GroupMates).ConfigureAwait(false);
            }

            if (updated.Tasks != null && updated.Tasks.Count > 0)
            {
                await _taskModelsRepository.AddRangeAsync(updated.Tasks).ConfigureAwait(false);
            }
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

            var studentGroups = await _groupsRepository
                .GetGroupsWithGroupMatesAsync(studentGroupsIds)
                .ConfigureAwait(false);

            return studentGroups
                .Where(g => g.CourseId == courseId)
                .Select(c => _mapper.Map<UserGroupDescription>(c))
                .ToArray();
        }
    }
}
