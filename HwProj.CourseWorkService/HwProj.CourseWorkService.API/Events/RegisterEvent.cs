using HwProj.EventBus.Client;

namespace HwProj.CourseWorkService.API.Events
{
	public abstract class RegisterEvent : Event
	{
		protected RegisterEvent(string userId, string email, string name, string surname = "", string middleName = "")
		{
			UserId = userId;
			Name = name;
			Surname = surname;
			MiddleName = middleName;
			Email = email;
		}

		public string UserId { get; set; }
		public string Name { get; set; }
		public string Surname { get; set; }
		public string MiddleName { get; set; }
		public string Email { get; set; }
	}
}