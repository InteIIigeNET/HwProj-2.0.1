using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Lti.Configuration;
using HwProj.APIGateway.API.Lti.DTOs;
using HwProj.APIGateway.API.Lti.Mappings;
using Microsoft.Extensions.Options;

namespace HwProj.APIGateway.API.Lti.Services;

public class LtiToolService(IOptions<List<LtiToolConfig>> options) : ILtiToolService
{
    private readonly IReadOnlyList<LtiToolConfig> _tools = (options.Value ?? []).AsReadOnly();

    public IReadOnlyList<LtiToolDto> GetAll()
        => _tools
            .Select(LtiToolMapper.LtiToolConfigToDto)
            .ToList()
            .AsReadOnly();

    public LtiToolDto? GetByName(string name)
        => _tools.FirstOrDefault(t => t.Name == name)?.LtiToolConfigToDto();

    public LtiToolDto? GetByIssuer(string issuer)
        => _tools.FirstOrDefault(t => t.Issuer == issuer)?.LtiToolConfigToDto();

    public LtiToolDto? GetByClientId(string clientId)
        => _tools.FirstOrDefault(t => t.ClientId == clientId)?.LtiToolConfigToDto();
}