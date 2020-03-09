using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;

namespace HwProj.CourseWorkService.API.Services
{
    public interface IUserService : IEntityService<User>
    {
        Task<User> GetUserAuthAsync(string userAuthId);
        Task<long> GetIdByAuthId(string userAuthId);
    }
}
