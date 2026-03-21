using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Lti.DTOs;

namespace HwProj.APIGateway.API.Lti.Services;

public interface ILtiToolService
{
    IReadOnlyList<LtiToolDto> GetAll();
    LtiToolDto? GetByName(string name);
    LtiToolDto? GetByIssuer(string issuer);
    LtiToolDto? GetByClientId(string clientId);
}