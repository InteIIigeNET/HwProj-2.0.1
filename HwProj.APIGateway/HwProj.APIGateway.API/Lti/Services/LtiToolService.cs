using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Lti.Models;
using Microsoft.Extensions.Options;

namespace HwProj.APIGateway.API.Lti.Services;

public class LtiToolService(IOptions<List<LtiToolConfig>> options) : ILtiToolService
{
    private readonly IReadOnlyList<LtiToolConfig> _tools = (options.Value ?? []).AsReadOnly();

    public Task<IReadOnlyList<LtiToolDto>> GetAllAsync()
    {
        var result = _tools
            .Select(t => new LtiToolDto(
                t.Id,
                t.Name,
                t.ClientId,
                t.InitiateLoginUri,
                t.LaunchUrl,
                t.DeepLink))
            .ToList()
            .AsReadOnly();
        
        return Task.FromResult<IReadOnlyList<LtiToolDto>>(result);
    }

    public Task<LtiToolDto?> GetByIdAsync(long id)
    {
        var cfg = _tools.FirstOrDefault(t => t.Id == id);
        if (cfg == null)
            return Task.FromResult<LtiToolDto?>(null);

        var dto = new LtiToolDto(
            cfg.Id,
            cfg.Name,
            cfg.ClientId,
            cfg.InitiateLoginUri,
            cfg.LaunchUrl,
            cfg.DeepLink);

        return Task.FromResult<LtiToolDto?>(dto);
    }
}