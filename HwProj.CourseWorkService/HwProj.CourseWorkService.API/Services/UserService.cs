using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services
{
    public class UserService : IUserService
    {
        private readonly IUsersRepository _usersRepository;

        public UserService(IUsersRepository usersRepository)
        {
            _usersRepository = usersRepository;
        }

        public async Task<User> GetUserAsync(long userId)
        {
            return await _usersRepository.GetAsync(userId);
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

        public async Task<User[]> GetAllUsersAsync()
        {
            return await _usersRepository.GetAll().ToArrayAsync();
        }

        public async Task UpdateUserAsync(long userId, User update)
        {
            await _usersRepository.UpdateAsync(userId, u => update);
        }
    }
}
