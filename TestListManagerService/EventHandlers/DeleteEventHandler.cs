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
        private UsersContext db;

        public DeleteEventHandler(UsersContext context)
        {
            db = context;
        }

        public Task HandleAsync(DeleteEvent @event)
        {
            var user = db.Users.FirstOrDefault(x => x.Id == @event.DeletedId);
            db.Users.Remove(user ?? throw new InvalidOperationException());
            db.SaveChanges();
            return Task.CompletedTask;
        }
    }
}
