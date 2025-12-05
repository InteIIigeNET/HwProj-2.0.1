using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Lti.Models;

namespace HwProj.APIGateway.API.Lti.Services;

public interface ILtiToolService
{
    Task<IReadOnlyList<LtiToolDto>> GetAllAsync();
    Task<LtiToolDto?> GetByIdAsync(long id);
}