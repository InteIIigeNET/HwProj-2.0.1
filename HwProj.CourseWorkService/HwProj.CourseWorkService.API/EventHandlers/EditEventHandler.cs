using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Events;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.EventBus.Client.Interfaces;

namespace HwProj.CourseWorkService.API.EventHandlers
{
    public class EditEventHandler : IEventHandler<EditEvent>
    {
        private readonly IUsersRepository _usersRepository;

        public EditEventHandler(IUsersRepository usersRepository)
        {
            _usersRepository = usersRepository;
        }

        public async Task HandleAsync(EditEvent @event)
        {
            await _usersRepository.UpdateAsync(@event.UserId, u => new User()
            {
                Name = @event.NewName,
                Surname = @event.NewSurname,
                MiddleName = @event.NewMiddleName
            }).ConfigureAwait(false);
        }
    }
}
