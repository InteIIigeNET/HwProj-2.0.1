namespace HwProj.AuthService.API
{
    public class AppSettings
    {
        public string SecurityKey { get; set; }
        public string ApiName { get; set; }
        public string ClientIdGitHub { get; set; }
        public string ClientSecretGitHub { get; set; }
        public double ExpireInForToken { get; set; }
        public double ExpireInForResponse { get; set; }
    }
}