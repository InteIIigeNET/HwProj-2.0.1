using FirstTestUserService.Events;
using System.Threading.Tasks;
using FirstTestUserService.Models;
using HwProj.EventBus.Abstractions;

namespace FirstTestUserService.EventHandlers
{
    public class UpdateEventHandler : IEventHandler<UpdateEvent>
    {
        private readonly UsersContext _db;

        public UpdateEventHandler(UsersContext context)
        {
            _db = context;
        }

        public Task HandleAsync(UpdateEvent @event)
        {
            _db.Users.Update(new User { Id = @event.UpdatedId, Name = @event.UpdatedName });
            _db.SaveChanges();
            return Task.CompletedTask;
        }
    }
}
