using System.Security.Claims;
using System.Threading.Tasks;

namespace HwProj.APIGateway.API.LTI.Services;

public interface ILtiTokenService
{
    string CreateLtiIdToken(
        ClaimsPrincipal user,
        string clientId,
        string redirectUri,
        string nonce,
        string ltiMessageHint);
}