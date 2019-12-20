namespace HwProj.AuthService.API.Models
{
    public class AccountData
    {
        public string Name { get; }
        public string SurName { get; }
        public string Email { get; }
        public string Role { get; }

        public AccountData(string name, string surName, string email, string role)
        {
            Name = name;
            SurName = surName;
            Email = email;
            Role = role;
        }
    }
}
