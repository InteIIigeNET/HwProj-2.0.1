using HwProj.EventBus.Event;

namespace SecondTestUserService.Events
{
    public class AddEvent : Event
    {
        public string AddedName { get; set; }

        public AddEvent (string name)
        {
            AddedName = name;
        }
    }
}
