using System.Collections.Generic;
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
        private readonly CourseContext _courseContext;

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
            return await _groupsRepository.GetAllInCourseWithGroupMates(courseId).ToArrayAsync();
        }

        public async Task<Group> GetGroupAsync(long groupId)
        {
            return await _groupsRepository.GetGroupWithGroupMatesAsync(groupId);
        }

        public async Task<long> AddGroupAsync(Group group)
        { 
            var mates = group.GroupMates;
            var tasks = group.Tasks;
            group.GroupMates = null;
            group.Tasks = null;
            var groupId = await _groupsRepository.AddAsync(group).ConfigureAwait(false);

            mates.ForEach(cm => cm.GroupId = groupId);
            tasks.ForEach(cm => cm.GroupId = groupId);
            _courseContext.AddRange(mates);
            _courseContext.AddRange(tasks);
            _courseContext.SaveChanges();

            return groupId;
        }

        public async Task AddGroupMateAsync(long groupId, string studentId)
        {
            var groupMate = new GroupMate
            {
                GroupId = groupId,
                StudentId = studentId,
            };

            await _groupMatesRepository.AddAsync(groupMate);
        }

        public async Task DeleteGroupAsync(long groupId)
        {
            await _groupsRepository.DeleteAsync(groupId);
        }

        public async Task UpdateAsync(long groupId, Group updated)
        {
            var group = await _groupsRepository.GetAsync(groupId);
            _courseContext.RemoveRange(group.GroupMates);
            _courseContext.RemoveRange(group.Tasks);
            updated.GroupMates.ForEach(cm => cm.GroupId = groupId);
            updated.Tasks.ForEach(cm => cm.GroupId = groupId);
            _courseContext.AddRange(updated.GroupMates);
            _courseContext.AddRange(updated.Tasks);
            _courseContext.SaveChanges();
            await _groupsRepository.UpdateAsync(groupId, c => new Group
            {
                Name = updated.Name,
            });
        }

        public async Task<bool> DeleteGroupMateAsync(long groupId, string studentId)
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


            await _groupMatesRepository.DeleteAsync(getGroupMateTask.Id);
            return true;
        }

        public async Task<UserGroupDescription[]> GetStudentsGroupsAsync(long courseId, string studentId)
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

            return studentGroups.Select(c =>
            {
                var userGroupDescription = _mapper.Map<UserGroupDescription>(c);
                return userGroupDescription;
            }).ToArray();
        }

        public async Task<long[]> GetTasksIds(long groupId)
        {
            var getGroupTask = await _groupsRepository.GetAsync(groupId);
            return getGroupTask.Tasks.Select(cm => cm.TaskId).ToArray();
        }
    }
}