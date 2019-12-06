using FirstTestUserService.Events;
using System.Threading.Tasks;
using FirstTestUserService.Models;
using HwProj.EventBus.Abstractions;

namespace FirstTestUserService.EventHandlers
{
    public class AddEventHandler : IEventHandler<AddEvent>
    {
        private readonly UsersContext _db;

        public AddEventHandler(UsersContext context)
        {
            _db = context;
        }

        public Task HandleAsync(AddEvent @event)
        {
            _db.Users.Add(new User { Name = @event.AddedName });
            _db.SaveChanges();
            return Task.CompletedTask;
        }
    }
}
