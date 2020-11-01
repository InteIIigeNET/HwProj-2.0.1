using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Events;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.EventBus.Client.Interfaces;

namespace HwProj.CourseWorkService.API.EventHandlers
{
    public class InviteLecturerEventHandler : IEventHandler<InviteLecturerEvent>
    {
        private readonly IUsersRepository _usersRepository;

        public InviteLecturerEventHandler(IUsersRepository usersRepository)
        {
            _usersRepository = usersRepository;
        }

        public async Task HandleAsync(InviteLecturerEvent @event)
        {
            await _usersRepository.AddRoleAsync(@event.UserId, RoleNames.Lecturer).ConfigureAwait(false);
            await _usersRepository.RemoveRoleAsync(@event.UserId, RoleNames.Student).ConfigureAwait(false);
        }
    }
}
