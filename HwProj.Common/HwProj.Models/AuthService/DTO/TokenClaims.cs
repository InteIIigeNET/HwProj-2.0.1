namespace HwProj.Models.AuthService.DTO
{
    public class TokenClaims
    {
        public string? UserName { get; set; }
        
        public string? Id { get; set; }
        
        public string? Email { get; set; }
        
        public string? Role { get; set; }
    }
}
