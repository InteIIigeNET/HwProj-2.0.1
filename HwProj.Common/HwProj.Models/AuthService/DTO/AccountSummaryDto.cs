namespace HwProj.Models.AuthService.DTO
{
    public class AccountSummaryDto
    {
        public string UserId { get; set; }
        public string Email { get; }
        public string Role { get; }

        public AccountSummaryDto(
            string userId,
            string email,
            string role)
        {
            UserId = userId;
            Email = email;
            Role = role;
        }
    }
}