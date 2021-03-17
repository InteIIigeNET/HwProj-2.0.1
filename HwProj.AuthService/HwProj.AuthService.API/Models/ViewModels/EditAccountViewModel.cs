namespace HwProj.AuthService.API.Models.ViewModels
{
    public class EditAccountViewModel
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string MiddleName { get; set; }
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}
