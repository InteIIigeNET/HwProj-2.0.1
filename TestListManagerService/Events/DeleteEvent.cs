using HwProj.EventBus.Event;

namespace FirstTestUserService.Events
{
    public class DeleteEvent : Event
    {
        public int DeletedId { get; set; }

        public DeleteEvent(int deletedId)
        {
            DeletedId = deletedId;
        }
    }
}
