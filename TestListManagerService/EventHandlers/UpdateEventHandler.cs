using FirstTestUserService.Events;
using System.Threading.Tasks;
using FirstTestUserService.Models;
using HwProj.EventBus.Abstractions;

namespace FirstTestUserService.EventHandlers
{
    public class UpdateEventHandler : IEventHandler<UpdateEvent>
    {
        private UsersContext db;

        public UpdateEventHandler(UsersContext context)
        {
            db = context;
        }

        public Task HandleAsync(UpdateEvent @event)
        {
            db.Users.Update(new User() { Id = @event.UpdatedId, Name = @event.UpdatedName });
            db.SaveChanges();
            return Task.CompletedTask;
        }
    }
}
