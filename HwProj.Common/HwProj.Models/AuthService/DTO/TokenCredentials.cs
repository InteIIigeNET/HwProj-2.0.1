namespace HwProj.Models.AuthService.DTO
{
    public class TokenCredentials
    {
        public string AccessToken { get; set; }
        public int ExpiresIn { get; set; }
    }
}
