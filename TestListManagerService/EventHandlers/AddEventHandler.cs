using FirstTestUserService.Events;
using System.Threading.Tasks;
using FirstTestUserService.Models;
using HwProj.EventBus.Abstractions;

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
