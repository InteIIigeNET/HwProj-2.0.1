namespace HwProj.APIGateway.API.Lti.DTOs;

public record LtiToolDto(
    string Name,
    string issuer,
    string ClientId,
    string JwksEndpoint,
    string InitiateLoginUri,
    string LaunchUrl,
    string DeepLink);