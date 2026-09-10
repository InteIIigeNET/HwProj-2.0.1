using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;

namespace HwProj.APIGateway.API.Lti.Services;

public interface ILtiKeyService
{
    Task<IEnumerable<SecurityKey>?> GetKeysAsync(string jwksUrl);
}