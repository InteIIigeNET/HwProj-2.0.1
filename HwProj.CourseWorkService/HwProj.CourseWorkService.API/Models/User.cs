using HwProj.Repositories;
using System.Collections.Generic;

namespace HwProj.CourseWorkService.API.Models
{
    public class User : IEntity<string>
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }

        public StudentProfile StudentProfile { get; set; }
        public LecturerProfile LecturerProfile { get; set; }
        public ReviewerProfile ReviewerProfile { get; set; }
        public List<UserRole> UserRoles { get; set; }

        public User()
        {
            UserRoles = new List<UserRole>();
        }
    }
}
