using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories.Interfaces
{
    public interface IUsersRepository : ICrudRepository<User, string>
    {
        Task<User> GetUserAsync(string userId);
        Task<RoleNames[]> GetRoles(string userId);
        Task AddRoleAsync(string userId, RoleNames role);
        Task RemoveRoleAsync(string userId, RoleNames role);
    }
}
