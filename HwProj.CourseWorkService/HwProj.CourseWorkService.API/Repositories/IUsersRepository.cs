using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories
{
    public interface IUsersRepository : ICrudRepository<User, string>
    {
        Task<string[]> GetRoles(string id);
        Task AddNewUserAsync(User user);
        Task AddRoleAsync(string userId, string role);
        Task RemoveRoleAsync(string userId, string role);
    }
}
