using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.DTO;
using HwProj.CoursesService.API.Repositories;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

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

        public async Task<Group[]> GetAllAsync(long courseId)
        {
            return await _groupsRepository.GetAllWithCourseMates(courseId).ToArrayAsync();
        }

        public async Task<Group> GetGroupAsync(long groupId)
        {
            return await _groupsRepository.GetGroupWithCourseMatesAsync(groupId);
        }

        public async Task<long> AddGroupAsync(Group group, long courseId)
        {
            group.CourseId = courseId;
            return await _groupsRepository.AddAsync(group);
        }

        public async Task<bool> AddCourseMateInGroupAsync(long groupId, string studentId)
        {
            var getGroupTask = _groupsRepository.GetAsync(groupId);
            await getGroupTask.ConfigureAwait(false);
            if (getGroupTask.Result == null)
            {
                return false;
            }

            var courseId = getGroupTask.Result.CourseId;
            var getCourseMateTask =
                _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await getCourseMateTask.ConfigureAwait(false);


            if (getCourseMateTask.Result == null)
            {
                var courseMate = new CourseMate
                {
                    CourseId = courseId,
                    StudentId = studentId,
                    IsAccepted = true
                };

                await _courseMatesRepository.AddAsync(courseMate);
            }

            if (getCourseMateTask.Result.Groups.Contains(getGroupTask.Result.Id))
            {
                return false;
            }

            getCourseMateTask.Result.Groups.Add(getGroupTask.Result.Id);
            return true;
        }

        public async Task DeleteGroupAsync(long id)
        {
            var removeFromCourseMatesTask = _courseMatesRepository.FindAll(cm => cm.Groups.Contains(id))
                .Select(cm => cm.Groups.Remove(id));
            await _groupsRepository.DeleteAsync(id).ConfigureAwait(false);
        }

        public async Task UpdateAsync(long groupId, Group updated)
        {
            await _groupsRepository.UpdateAsync(groupId, c => new Group
            {
                Name = updated.Name
            });
        }

        public async Task<bool> DeleteCourseMateFromGroupAsync(long groupId, string studentId)
        {
            var getGroupTask = _groupsRepository.GetAsync(groupId);
            await getGroupTask.ConfigureAwait(false);
            if (getGroupTask.Result == null)
            {
                return false;
            }

            var courseId = getGroupTask.Result.CourseId;
            var getCourseMateTask =
                _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await getCourseMateTask.ConfigureAwait(false);
            if (!getCourseMateTask.Result.Groups.Contains(getGroupTask.Result.Id))
            {
                return false;
            }


            getCourseMateTask.Result.Groups.Remove(groupId);
            return true;
        }

        public async Task<UserGroupDescription[]> GetCourseMateGroupsAsync(long courseId, string studentId)
        {
            var getCourseMateTask =
                _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await getCourseMateTask.ConfigureAwait(false);

            var groups = new List<UserGroupDescription>();
            getCourseMateTask.Result.Groups.ForEach(async cm =>
            {
                var group = await _groupsRepository.GetAsync(cm);
                groups.Add(_mapper.Map<UserGroupDescription>(group));
            });

            return groups.ToArray();
        }
    }
}
