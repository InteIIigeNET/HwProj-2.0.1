﻿using System;
using Newtonsoft.Json;

namespace HwProj.EventBus.Client
{
	public class Event
	{
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

		[JsonProperty] public Guid Id { get; set; }

		[JsonProperty] public DateTime CreationData { get; set; }
	}
}