using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Events;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.EventBus.Client.Interfaces;

namespace HwProj.CourseWorkService.API.EventHandlers
{
    public class CreateAdminEventHandler : IEventHandler<AdminRegisterEvent>
    {
        private readonly IUsersRepository _usersRepository;

        public CreateAdminEventHandler(IUsersRepository usersRepository)
        {
            _usersRepository = usersRepository;
        }

        public async Task HandleAsync(AdminRegisterEvent @event)
        {
            var user = new User()
            {
                Id = @event.UserId,
                Name = @event.Name,
                Surname = @event.Surname,
                MiddleName = @event.MiddleName,
                Email = @event.Email
            };

            await _usersRepository.AddAsync(user).ConfigureAwait(false);
            await _usersRepository.AddRoleToUserAsync(@event.UserId, Roles.Lecturer).ConfigureAwait(false);
            await _usersRepository.AddRoleToUserAsync(@event.UserId, Roles.Curator).ConfigureAwait(false);
        }
    }
}
