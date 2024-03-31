using Microsoft.AspNetCore.Identity;

namespace HwProj.Models.Roles
{
    public static class Roles
    {
        public static IdentityRole Lecturer = new IdentityRole("Lecturer");
        public static IdentityRole Student = new IdentityRole("Student");
        public static IdentityRole Expert = new IdentityRole("Expert");
        public const string LecturerRole = "Lecturer";
        public const string StudentRole = "Student";
        public const string ExpertRole = "Expert";
    }
}
