using System;

namespace HwProj.Models.AuthService.DTO
{
    public class TokenCredentials
    {
        public string AccessToken { get; set; }
        public DateTime ExpiresIn { get; set; }
    }
}
