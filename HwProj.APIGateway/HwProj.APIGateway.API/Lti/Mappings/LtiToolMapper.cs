using HwProj.APIGateway.API.Lti.Configuration;
using HwProj.APIGateway.API.Lti.DTOs;

namespace HwProj.APIGateway.API.Lti.Mappings;

public static class LtiToolMapper
{
    public static LtiToolDto LtiToolConfigToDto(this LtiToolConfig t)
    {
        return new LtiToolDto(
            t.Name,
            t.ClientId,
            t.JwksEndpoint,
            t.InitiateLoginUri,
            t.LaunchUrl,
            t.DeepLink
        );
    }
}