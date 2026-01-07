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
            .Select(MapToDto)
            .ToList()
            .AsReadOnly();
        
        return Task.FromResult<IReadOnlyList<LtiToolDto>>(result);
    }

    public Task<LtiToolDto?> GetByIdAsync(long id)
    {
        var cfg = _tools.FirstOrDefault(t => t.Id == id);
        return Task.FromResult(cfg == null ? null : MapToDto(cfg));
    }

    public Task<LtiToolDto?> GetByIssuerAsync(string issuer)
    {
        // Ищем конфиг, где Issuer совпадает с тем, что пришел в токене
        var cfg = _tools.FirstOrDefault(t => t.Issuer == issuer);
        return Task.FromResult(cfg == null ? null : MapToDto(cfg));
    }

    // Вынес создание DTO в отдельный метод, чтобы не дублировать код
    private static LtiToolDto MapToDto(LtiToolConfig t)
    {
        return new LtiToolDto(
            t.Id,
            t.Name,
            t.ClientId,
            t.JwksEndpoint,
            t.InitiateLoginUri,
            t.LaunchUrl,
            t.DeepLink
        );
    }
}