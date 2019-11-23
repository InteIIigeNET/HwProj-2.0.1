using HwProj.EventBus;

namespace FirstTestUserService.Events
{
    public class UpdateEvent : Event
    {
        public int UpdatedId { get; set; }

        public string UpdatedName { get; set; }

        public UpdateEvent(string updatedName, int updatedId)
        {
            UpdatedName = updatedName;
            UpdatedId = updatedId;
        }
    }
}
