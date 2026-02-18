using System.Security.Claims;
using System.Threading.Tasks;

namespace HwProj.APIGateway.API.LTI.Services;

public interface ILtiTokenService
{
    string CreateDeepLinkingToken(
        string clientId,
        string toolId,
        string courseId,
        string targetLinkUri,
        string userId,
        string nonce);

    public string CreateResourceLinkToken(
        string clientId,
        string toolId,
        string courseId,
        string targetLinkUri,
        string userId,
        string nonce,
        string resourceLinkId);
}