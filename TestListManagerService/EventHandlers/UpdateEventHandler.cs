using FirstTestUserService.Events;
using HwProj.EventBus;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
