using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.DTO;

namespace HwProj.CoursesService.API.Services
{
    public interface IGroupsService
    {
        Task<Group[]> GetAllAsync(long courseId);
        
        Task<Group[]> GetGroupsAsync(params long[] groupIds);
        
        Task<long> AddGroupAsync(Group group);
        
        Task DeleteGroupAsync(long id);
        
        Task UpdateAsync(long groupId, Group updated);
        
        Task AddGroupMateAsync(long groupId, string studentId);
        
        Task<UserGroupDescription[]> GetStudentGroupsAsync(long courseId, string studentId);
    }
}
