using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories.Interfaces
{
    public interface IUsersRepository : ICrudRepository<User, string>
    {
        Task<User> GetUserAsync(string userId);
        Task<Roles[]> GetRolesTypesAsync(string userId);
        Task<Role[]> GetRolesAsync(string userId);
        Task<User[]> GetUsersByRoleAsync(Roles role);
        Task AddRoleToUserAsync(string userId, Roles role);
        Task RemoveRoleFromUserAsync(string userId, Roles role);
        Task UpdateUserRoleProfileAsync<TProfile>(string userId, TProfile roleProfile) where TProfile : class, IProfile;
        Task SetReviewersToCuratorBidding(string curatorId, string[] reviewersId);
    }
}
