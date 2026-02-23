namespace HwProj.APIGateway.API.Lti.Models;

public class LtiPlatformConfig
{
    public string Issuer { get; set; }
    public string OidcAuthorizationEndpoint { get; set; }
    public string DeepLinkReturnUrl { get; set; }
    public string ResourceLinkReturnUrl { get; set; }
    public string AssignmentsGradesEndpoint { get; set; }
    public string JwksEndpoint { get; set; }
    public LtiSigningKeyConfig SigningKey { get; set; }
}

public class LtiSigningKeyConfig
{
    public string KeyId { get; set; }
    public string PrivateKeyPem { get; set; }
}