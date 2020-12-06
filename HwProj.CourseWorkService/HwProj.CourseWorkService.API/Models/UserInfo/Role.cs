using System.Collections.Generic;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models.UserInfo
{
    public enum RoleTypes
    {
        None,
        Student,
        Lecturer,
        Reviewer,
        Curator
    }

    public class Role : IEntity<long>
    {
        public long Id { get; set; }
        public RoleTypes RoleType { get; set; }
        public string DisplayName { get; set; }
        public List<UserRole> UserRoles { get; set; }

        public Role()
        {
            UserRoles = new List<UserRole>();
        }
    }
}
