using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;

namespace HwProj.CourseWorkService.API.Services
{
    public class UserService : EntityService<User>, IUserService
    {
        private readonly IUsersRepository _usersRepository;

        public UserService(IUsersRepository usersRepository) : base(usersRepository)
        {
            _usersRepository = usersRepository;
        }


        public async Task<User> GetUserAuthAsync(string userAuthId)
        {
            return await _usersRepository.FindAsync(u => u.AuthId == userAuthId);
        }

        public async Task<long> GetIdByAuthId(string userAuthId)
        {
            var user = await GetUserAuthAsync(userAuthId).ConfigureAwait(false);
            return user.Id;
        }
    }
}
