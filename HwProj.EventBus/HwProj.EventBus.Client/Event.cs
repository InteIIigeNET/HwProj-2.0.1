using System;
using Newtonsoft.Json;

namespace HwProj.EventBus.Client
{
    public enum EventCategory
    {
        Users,
        Courses,
        Homeworks,
        Tasks,
        Solutions
    }

    public abstract class Event
    {
        [JsonProperty] public Guid Id { get; set; }
        [JsonProperty] public DateTime CreationData { get; set; }
        public abstract string EventName { get; }
        public abstract EventCategory Category { get; }

        protected Event()
        {
            Id = Guid.NewGuid();
            CreationData = DateTime.UtcNow;
        }

        protected Event(Guid id, DateTime data)
        {
            Id = id;
            CreationData = data;
        }
    }
}
