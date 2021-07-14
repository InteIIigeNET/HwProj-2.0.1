using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HwProj.CourseWorkService.API.Models.UserInfo
{
    [Table("UserRoles")]
    public class UserRole
    {
        public long RoleId { get; set; }
        public Role Role { get; set; }

        [Required]
        public string UserId { get; set; }
        public User User { get; set; }
    }
}
