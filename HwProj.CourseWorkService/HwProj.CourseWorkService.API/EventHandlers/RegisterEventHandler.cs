using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Events;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.EventBus.Client.Interfaces;

namespace HwProj.CourseWorkService.API.EventHandlers
{
    public class RegisterEventHandler : IEventHandler<RegisterEvent>
    {
        private readonly IUsersRepository _usersRepository;

        public RegisterEventHandler(IUsersRepository usersRepository)
        {
            _usersRepository = usersRepository;
        }

        public async Task HandleAsync(RegisterEvent @event)
        {
            var user = new User()
            {
                Id = @event.UserId,
                UserName = @event.UserName,
                Email = @event.Email
            };

            var userId = await _usersRepository.AddAsync(user).ConfigureAwait(false);
            await _usersRepository.AddRoleAsync(userId, RoleNames.Student).ConfigureAwait(false);
        }
    }
}
