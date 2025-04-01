namespace HwProj.Models.AuthService.DTO
{
    public class RegisterDataDTO
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string MiddleName { get; set; }
        public string Email { get; set; }
        public bool IsExternalAuth { get; set; }
    }
}
