using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Events;
using HwProj.CourseWorkService.API.Repositories;
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
            await _usersRepository.AddRoleAsync(@event.UserId, "Lecturer").ConfigureAwait(false);
            await _usersRepository.RemoveRoleAsync(@event.UserId, "Student");
        }
    }
}
