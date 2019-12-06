using System;
using Newtonsoft.Json;

namespace HwProj.EventBus.Event
{
    public class Event
    {
        [JsonProperty]
        public Guid Id { get; set; }

        [JsonProperty]
        public DateTime CreationData { get; set; }

        public Event()
        {
            Id = Guid.NewGuid();
            CreationData = DateTime.UtcNow;
        }

        public Event(Guid id, DateTime data)
        {
            Id = id;
            CreationData = data;
        }
    }
}
