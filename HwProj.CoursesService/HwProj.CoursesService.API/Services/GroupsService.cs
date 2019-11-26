using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.DTO;
using HwProj.CoursesService.API.Repositories;
using System.Threading.Tasks;
using System.Collections.Generic;

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

        public async Task<Group> GetWithStudentsAsync(long courseId)
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
            await getCourseMateTask.ConfigureAwait(false);

            if (getGroupTask.Result == null)
            {
                return false;
            }

            if (getCourseMateTask.Result.Groups.Contains(getGroupTask.Result.Id))
            {
                return false;
            }

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

            getCourseMateTask.Result.Groups.Add(getGroupTask.Result.Id);
            return true;
        }

        public Task<Group[]> GetAllAsync()
        {
            throw new System.NotImplementedException();
        }

        public Task<Group> GetAsync(long courseId)
        {
            throw new System.NotImplementedException();
        }

        public async Task DeleteAsync(long id)
        {
            await _groupsRepository.DeleteAsync(id);
        }

        public Task UpdateAsync(long courseId, Course updated)
        {
            throw new System.NotImplementedException();
        }

        public Task<bool> DeleteCourseMateFromGroupAsync(long groupId, string studentId)
        {
            throw new System.NotImplementedException();
        }

        public async Task<UserGroupDescription[]> GetCourseMateGroupsAsync(long courseId, string studentId)
        {
            var getCourseMateTask =
                _courseMatesRepository.FindAsync(cm => cm.CourseId == courseId && cm.StudentId == studentId);
            await getCourseMateTask.ConfigureAwait(false);

            var groups = new List<Group>();
            getCourseMateTask.Result.Groups.ForEach(async cm => groups.Add(await _groupsRepository.GetAsync(cm)));

            throw new System.NotImplementedException();
        }
    }
}
