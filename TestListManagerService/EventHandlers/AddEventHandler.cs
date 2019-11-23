using FirstTestUserService.Events;
using HwProj.EventBus;
using System.Threading.Tasks;

namespace FirstTestUserService.EventHandlers
{
    public class AddEventHandler : IEventHandler<AddEvent>
    {
        private UsersContext db;

        public AddEventHandler(UsersContext context)
        {
            db = context;
        }

        public Task HandleAsync(AddEvent @event)
        {
            db.Users.Add(new User() { Name = @event.AddedName });
            db.SaveChanges();
            return Task.CompletedTask;
        }
    }
}
