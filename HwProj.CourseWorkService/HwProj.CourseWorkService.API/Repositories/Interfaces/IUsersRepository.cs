using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories.Interfaces
{
    public interface IUsersRepository : ICrudRepository<User, string>
    {
        Task<User> GetUserAsync(string userId);
        Task<RoleTypes[]> GetRolesTypesAsync(string userId);
        Task<Role[]> GetRolesAsync(string userId);
        Task<User[]> GetUsersByRoleAsync(RoleTypes role);
        Task AddRoleToUserAsync(string userId, RoleTypes role);
        Task RemoveRoleFromUserAsync(string userId, RoleTypes role);
        Task UpdateUserRoleProfileAsync<TProfile>(string userId, TProfile roleProfile) where TProfile : class, IProfile;
    }
}
