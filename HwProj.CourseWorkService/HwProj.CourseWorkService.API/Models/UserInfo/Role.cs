using System.Collections.Generic;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Models.UserInfo
{
    public enum Roles
    {
        Student = 1,
        Lecturer,
        Reviewer,
        Curator
    }

    public class Role : IEntity<long>
    {
        public long Id { get; set; }
        public string DisplayValue { get; set; }
        public List<UserRole> UserRoles { get; set; }

        public Role()
        {
            UserRoles = new List<UserRole>();
        }
    }
}
