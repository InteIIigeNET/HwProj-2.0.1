using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.DTO;

namespace HwProj.CoursesService.API.Services
{
    public interface IGroupsService
    {
        Task<Group[]> GetAllAsync();
        Task<Group> GetAsync(long courseId);
        Task<long> AddAsync(Group group, long courseId);
        Task DeleteAsync(long id);
        Task UpdateAsync(long courseId, Course updated);
        Task<bool> AddCourseMateInGroupAsync(long groupId, string studentId);
        Task<bool> DeleteCourseMateFromGroupAsync(long groupId, string studentId);
        Task<UserGroupDescription[]> GetCourseMateGroupsAsync(long courseId, string studentId);
    }
}
