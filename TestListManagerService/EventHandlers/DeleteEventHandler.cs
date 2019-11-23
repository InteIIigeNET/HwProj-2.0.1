using FirstTestUserService.Events;
using HwProj.EventBus;
using System.Linq;
using System.Threading.Tasks;

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
            db.Users.Remove(user);
            db.SaveChanges();
            return Task.CompletedTask;
        }
    }
}
