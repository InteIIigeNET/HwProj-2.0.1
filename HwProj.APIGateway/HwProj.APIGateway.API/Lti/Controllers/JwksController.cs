using System.Security.Cryptography;
using HwProj.APIGateway.API.Lti.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HwProj.APIGateway.API.Lti.Controllers;

[Route("api/lti")]
[ApiController]
public class JwksController(IOptions<LtiPlatformConfig> options) : ControllerBase
{
    private readonly LtiPlatformConfig _config = options.Value;

    [HttpGet("jwks")]
    [AllowAnonymous]
    public IActionResult GetJwks()
    {
        var keyConfig = _config.SigningKey;

        if (string.IsNullOrEmpty(keyConfig?.PrivateKeyPem))
        {
            return StatusCode(500, "Signing key is not configured.");
        }

        using var rsa = RSA.Create();
        try
        {
            rsa.ImportFromPem(keyConfig.PrivateKeyPem);
        }
        catch (CryptographicException)
        {
            return StatusCode(500, "Invalid Private Key format in configuration.");
        }

        var publicParams = rsa.ExportParameters(false);

        var jwks = new
        {
            keys = new[]
            {
                new
                {
                    kty = "RSA",
                    e = Base64UrlEncoder.Encode(publicParams.Exponent),
                    n = Base64UrlEncoder.Encode(publicParams.Modulus),
                    kid = keyConfig.KeyId,
                    alg = "RS256",
                    use = "sig"
                }
            }
        };

        return Ok(jwks);
    }
}