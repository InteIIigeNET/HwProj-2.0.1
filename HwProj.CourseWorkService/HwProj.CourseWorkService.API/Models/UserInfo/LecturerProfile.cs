using System.ComponentModel.DataAnnotations;

namespace HwProj.CourseWorkService.API.Models.UserInfo
{
	public class LecturerProfile : IProfile
	{
		public User User { get; set; }

		public long? DepartmentId { get; set; }
		public Department Department { get; set; }

		public string Contact { get; set; }
		public string Id { get; set; }

		[Required] public string UserId { get; set; }
	}
}