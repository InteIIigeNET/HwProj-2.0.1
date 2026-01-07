namespace HwProj.APIGateway.API.Lti.Models
{
    public class LtiToolDto(
        long id,
        string name,
        string clientId,
        string jwksEndpoint,
        string initiateLoginUri,
        string launchUrl,
        string deepLink)
    {
        public long Id  { get; init; } = id;
        public string Name { get; init; } = name;
        public string ClientId { get; init; } = clientId;
        public string JwksEndpoint { get; set; } = jwksEndpoint;
        public string InitiateLoginUri { get; init; } =  initiateLoginUri;
        public string LaunchUrl { get; init; } =  launchUrl;
        public string DeepLink { get; init; } = deepLink;
    }
}