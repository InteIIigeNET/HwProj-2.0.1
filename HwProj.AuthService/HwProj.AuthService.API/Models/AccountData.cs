namespace HwProj.AuthService.API.Models
{
    public class AccountData
    {
        public string UserName { get; }
        public string Email { get; }
        public string Role { get; }

        public AccountData(string userName, string email, string role)
        {
            UserName = userName;
            Email = email;
            Role = role;
        }
    }
}
