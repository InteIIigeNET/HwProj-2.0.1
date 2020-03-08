using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;

namespace HwProj.CourseWorkService.API.Services
{
    public interface IUserService
    {
        Task<User> GetUserAsync(long userId);
        Task<User> GetUserAuthAsync(string userAuthId);
        Task<long> GetIdByAuthId(string userAuthId);
        Task<User[]> GetAllUsersAsync();

        Task UpdateUserAsync(long userId, User update);
    }
}
