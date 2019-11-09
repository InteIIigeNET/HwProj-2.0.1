using System;

namespace HwProj.EventBus
{
    public class IntegrationEvent
    {
        public Guid Id { get; private set; }

        public DateTime CreationData { get; private set; }

        public IntegrationEvent()
        {
            Id = Guid.NewGuid();
            CreationData = DateTime.UtcNow;
        }

        public IntegrationEvent(Guid id, DateTime data)
        {
            Id = id;
            CreationData = data;
        }
    }
}
