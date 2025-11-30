namespace HwProj.APIGateway.API.LTI.Services;

public class LtiOptions
{
    public string? Issuer { get; set; }
    public string? DeploymentId { get; set; }
    public string? SigningKey { get; set; }
    public int TokenLifetimeMinutes { get; set; } = 5;
}