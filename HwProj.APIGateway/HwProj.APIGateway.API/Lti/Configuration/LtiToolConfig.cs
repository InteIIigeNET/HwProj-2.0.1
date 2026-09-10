namespace HwProj.APIGateway.API.Lti.Configuration
{
    public class LtiToolConfig
    {
        public string Name { get; set; }
        public string Issuer { get; set; } 
        public string ClientId { get; set; }
        public string JwksEndpoint { get; set; }
        public string InitiateLoginUri { get; set; }
        public string LaunchUrl { get; set; }
        public string DeepLink { get; set; } 
    }
}