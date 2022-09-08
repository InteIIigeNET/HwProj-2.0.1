using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Events;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.EventBus.Client.Interfaces;

namespace HwProj.CourseWorkService.API.EventHandlers
{
    public class RegisterEventHandler : EventHandlerBase<StudentRegisterEvent>
    {
        private readonly IUsersRepository _usersRepository;

        public RegisterEventHandler(IUsersRepository usersRepository)
        {
            _usersRepository = usersRepository;
        }

        public override async Task HandleAsync(StudentRegisterEvent @event)
        {
            var user = new User()
            {
                Id = @event.UserId,
                Name = @event.Name,
                Surname = @event.Surname,
                MiddleName = @event.MiddleName,
                Email = @event.Email
            };

            var userId = await _usersRepository.AddAsync(user).ConfigureAwait(false);
            await _usersRepository.AddRoleToUserAsync(userId, Roles.Student).ConfigureAwait(false);
        }
    }
}
