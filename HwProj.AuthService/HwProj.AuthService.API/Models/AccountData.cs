namespace HwProj.AuthService.API.Models
{
    public class AccountData
    {
        public string Name { get; }
        public string Surname { get; }
        public string Email { get; }
        public string Role { get; }

        public AccountData(string name, string surname, string email, string role)
        {
            Name = name;
            Surname = surname;
            Email = email;
            Role = role;
        }
    }
}
