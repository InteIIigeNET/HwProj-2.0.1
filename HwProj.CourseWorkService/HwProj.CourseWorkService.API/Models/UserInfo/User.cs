using System.Collections.Generic;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models.UserInfo
{
	public class User : IEntity<string>
	{
		public User()
		{
			UserRoles = new List<UserRole>();
		}

		public string Name { get; set; }
		public string Surname { get; set; }
		public string MiddleName { get; set; }
		public string Email { get; set; }

		public string UserName => Surname + " " + Name + " " + MiddleName;

		public StudentProfile StudentProfile { get; set; }
		public LecturerProfile LecturerProfile { get; set; }
		public ReviewerProfile ReviewerProfile { get; set; }
		public CuratorProfile CuratorProfile { get; set; }
		public List<UserRole> UserRoles { get; set; }
		public string Id { get; set; }
	}
}