using Microsoft.AspNetCore.Identity;

namespace HwProj.Models.Roles
{
    public static class Roles
    {
        public const string LecturerRole = "Lecturer";
        public const string StudentRole = "Student";
        public static IdentityRole Lecturer = new("Lecturer");
        public static IdentityRole Student = new("Student");
    }
}
