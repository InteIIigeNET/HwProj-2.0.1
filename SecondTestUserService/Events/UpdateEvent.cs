using HwProj.EventBus.Event;

namespace SecondTestUserService.Events
{
    public class UpdateEvent : Event
    {
        public int UpdatedId { get; set; }
        public string UpdatedName { get; set; }

        public UpdateEvent(string name, int updatedId)
        {
            UpdatedName = name;
            UpdatedId = updatedId;
        }
    }
}
