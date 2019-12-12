using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.DTO;

namespace HwProj.CoursesService.API.Services
{
    public interface IGroupsService
    {
        Task<Group[]> GetAllAsync(long courseId);
        Task<Group> GetGroupAsync(long groupId);
        Task<long> AddGroupAsync(Group group, long courseId);
        Task DeleteGroupAsync(long id);
        Task UpdateAsync(long groupId, Group updated);
        Task<bool> AddGroupMateAsync(long groupId, string studentId);
        Task<bool> DeleteGroupMateAsync(long groupId, string studentId);
        Task<UserGroupDescription[]> GetStudentsGroupsAsync(long courseId, string studentId);
    }
}
