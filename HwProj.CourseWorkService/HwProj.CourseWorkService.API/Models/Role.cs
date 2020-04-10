using System.Collections.Generic;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models
{
    public class Role : IEntity<long>
    {
        public long Id { get; set; }
        public string RoleName { get; set; }
        public List<UserRole> UserRoles { get; set; }

        public Role()
        {
            UserRoles = new List<UserRole>();
        }
    }
}
