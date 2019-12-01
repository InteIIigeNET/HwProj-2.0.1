using System;
using FirstTestUserService.Events;
using System.Linq;
using System.Threading.Tasks;
using FirstTestUserService.Models;
using HwProj.EventBus.Abstractions;

namespace FirstTestUserService.EventHandlers
{
    public class DeleteEventHandler : IEventHandler<DeleteEvent>
    {
        private readonly UsersContext _db;

        public DeleteEventHandler(UsersContext context)
        {
            _db = context;
        }

        public Task HandleAsync(DeleteEvent @event)
        {
            var user = _db.Users.FirstOrDefault(x => x.Id == @event.DeletedId);
            _db.Users.Remove(user ?? throw new InvalidOperationException());
            _db.SaveChanges();
            return Task.CompletedTask;
        }
    }
}
