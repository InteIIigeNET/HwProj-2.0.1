using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.CoursesService.API.Repositories.Groups;
using HwProj.Models.CoursesService.DTO;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class GroupsService : IGroupsService
    {
        private readonly IGroupsRepository _groupsRepository;
        private readonly IGroupMatesRepository _groupMatesRepository;
        private readonly ICourseFilterRepository _courseFilterRepository;
        private readonly IMapper _mapper;

        public GroupsService(IGroupsRepository groupsRepository,
            IGroupMatesRepository groupMatesRepository,
            ICourseFilterRepository courseFilterRepository,
            IMapper mapper)
        {
            _groupsRepository = groupsRepository;
            _groupMatesRepository = groupMatesRepository;
            _courseFilterRepository = courseFilterRepository;
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

            await _groupsRepository.DeleteAsync(groupId).ConfigureAwait(false);
        }

        public async Task UpdateAsync(long groupId, Group updated)
        {
            var group = (await _groupsRepository.GetGroupsWithGroupMatesAsync(groupId)).SingleOrDefault();

            if (group == null) return;

            var updatedGroupMates = updated.GroupMates ?? new List<GroupMate>();

            var currentStudentIds = (group.GroupMates?.Select(gm => gm.StudentId) ?? Enumerable.Empty<string>()).ToHashSet();
            var updatedStudentIds = updatedGroupMates.Select(gm => gm.StudentId).ToHashSet();

            var studentsToAdd = updatedStudentIds.Except(currentStudentIds).ToList();
            var studentsToRemove = currentStudentIds.Except(updatedStudentIds).ToList();


            var groupMatesToAdd = updatedGroupMates.Where(x => studentsToAdd.Contains(x.StudentId)).ToArray();
            foreach (var groupMate in groupMatesToAdd) 
                groupMate.GroupId = groupId;
            await _groupMatesRepository.AddRangeAsync(groupMatesToAdd);

            await _groupMatesRepository
                .FindAll(x => x.GroupId == groupId && studentsToRemove.Contains(x.StudentId))
                .DeleteFromQueryAsync();

            await _groupsRepository.UpdateAsync(groupId, g => new Group
            {
                Name = updated.Name
            });

            // Обновляем участников в фильтре группы
            var groupFilter = await _courseFilterRepository.GetAsync(groupId.ToString(), group.CourseId);
            if (groupFilter != null)
            {
                groupFilter.Filter.StudentIds = updatedStudentIds.ToList();
                await _courseFilterRepository.UpdateAsync(groupFilter.Id, f => new CourseFilter
                {
                    FilterJson = groupFilter.FilterJson
                });
            }
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
