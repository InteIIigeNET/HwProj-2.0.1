using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Events;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.EventBus.Client.Interfaces;

namespace HwProj.CourseWorkService.API.EventHandlers
{
    public class InviteLecturerEventHandler : EventHandlerBase<InviteLecturerEvent>
    {
        private readonly IUsersRepository _usersRepository;

        public InviteLecturerEventHandler(IUsersRepository usersRepository)
        {
            _usersRepository = usersRepository;
        }

        public override async Task HandleAsync(InviteLecturerEvent @event)
        {
            await _usersRepository.AddRoleToUserAsync(@event.UserId, Roles.Lecturer).ConfigureAwait(false);
            await _usersRepository.RemoveRoleFromUserAsync(@event.UserId, Roles.Student).ConfigureAwait(false);
        }
    }
}
