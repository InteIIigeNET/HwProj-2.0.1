namespace HwProj.AuthService.API.Models.DTO
{
    public class AccountDataDTO
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string MiddleName { get; set; }
        public string Email { get; }
        public string Role { get; }

        public AccountDataDTO(string name, string surname, string email, string role, string middleName = "")
        {
            Name = name;
            Surname = surname;
            MiddleName = middleName;
            Email = email;
            Role = role;
        }
    }
}
