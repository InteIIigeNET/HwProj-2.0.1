namespace HwProj.Models.AuthService.DTO
{
    public class TokenValidationResult
    {
        public bool IsValid { get; set; }
        public string Role { get; set; }
        public string UserId { get; set; }
    }
}