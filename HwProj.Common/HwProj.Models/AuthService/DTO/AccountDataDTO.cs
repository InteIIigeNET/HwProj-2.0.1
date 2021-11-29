namespace HwProj.Models.AuthService.DTO
{
    public class AccountDataDto
    {
        public AccountDataDto(string name, string surname, string email, string role, bool isExternalAuth,
            string middleName = "")
        {
            Name = name;
            Surname = surname;
            MiddleName = middleName;
            Email = email;
            Role = role;
            IsExternalAuth = isExternalAuth;
        }

        public string Name { get; set; }
        public string Surname { get; set; }
        public string MiddleName { get; set; }
        public string Email { get; }
        public string Role { get; }
        public bool IsExternalAuth { get; }
    }
}
