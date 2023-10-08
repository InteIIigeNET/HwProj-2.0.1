using System;
using Newtonsoft.Json;

namespace HwProj.EventBus.Client
{
    public class Event
    {
        [JsonProperty] public Guid Id { get; set; }

        [JsonProperty] public DateTime CreationData { get; set; }

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

    public class ScheduleEvent : Event
    {
        public long ScheduleWorkId { get; set; }

        public DateTime PublicationDate { get; set; }

        protected ScheduleEvent(long scheduleWorkId, DateTime publicationDate)
        {
            ScheduleWorkId = scheduleWorkId;
            PublicationDate = publicationDate;
        }
    }

    public class UpdateScheduleEvent : ScheduleEvent
    {
        public Type PreviousScheduleEventType { get; set; }

        protected UpdateScheduleEvent(long scheduleWorkId, DateTime publicationDate, Type previousScheduleEventType)
            : base(scheduleWorkId, publicationDate)
        {
            PreviousScheduleEventType = previousScheduleEventType;
        }
    }
}