using System;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;

namespace HwProj.EventBus.Tests
{
	public class OtherTestHandler : IEventHandler<TestEvent>
	{
		public OtherTestHandler()
		{
			NewPrice = 0;
			OldPrice = 0;
		}

		public int NewPrice { get; set; }
		public int OldPrice { get; set; }

		public int ChangedSum => Math.Abs(NewPrice - OldPrice);

		public Task HandleAsync(TestEvent @event)
		{
			NewPrice = @event.NewPrice;
			OldPrice = @event.OldPrice;

			return Task.CompletedTask;
		}
	}
}