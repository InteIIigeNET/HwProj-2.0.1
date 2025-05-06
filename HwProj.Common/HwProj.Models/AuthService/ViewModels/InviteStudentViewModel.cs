namespace HwProj.Models.AuthService.ViewModels
{
    public class InviteStudentViewModel
    {
        public long CourseId { get; set; }
        public string Email { get; set; }
        
        public string Name { get; set; }
        
        public string Surname { get; set; }

        public string MiddleName { get; set; }
    }
}