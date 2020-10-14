using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Events;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;

namespace HwProj.CourseWorkService.API.EventHandlers
{
    public class CreateAdminEventHandler : IEventHandler<CreateAdminEvent>
    {
        private readonly IUsersRepository _usersRepository;

        public CreateAdminEventHandler(IUsersRepository usersRepository)
        {
            _usersRepository = usersRepository;
        }

        public async Task HandleAsync(CreateAdminEvent @event)
        {
            var user = new User()
            {
                Id = @event.UserId,
                UserName = @event.UserName,
                Email = @event.Email
            };

            await _usersRepository.AddNewUserAsync(user).ConfigureAwait(false);
            await _usersRepository.RemoveRoleAsync(@event.UserId, RoleNames.Student).ConfigureAwait(false);
            await _usersRepository.AddRoleAsync(@event.UserId, RoleNames.Lecturer).ConfigureAwait(false);
            await _usersRepository.AddRoleAsync(@event.UserId, RoleNames.Curator).ConfigureAwait(false);
        }
    }
}
