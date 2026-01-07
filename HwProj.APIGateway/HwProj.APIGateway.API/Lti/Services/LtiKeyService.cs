using Microsoft.IdentityModel.Tokens;
using System.Net.Http;
using System.Threading.Tasks;
using System.Collections.Concurrent;
using System.Collections.Generic;
using HwProj.APIGateway.API.Lti.Services;

public class LtiKeyService(IHttpClientFactory httpClientFactory) : ILtiKeyService
{
    private static readonly ConcurrentDictionary<string, JsonWebKeySet> _keyCache = new();

    public async Task<IEnumerable<SecurityKey>?> GetKeysAsync(string jwksUrl)
    {
        if (string.IsNullOrEmpty(jwksUrl)) return null;

        if (_keyCache.TryGetValue(jwksUrl, out var keySet))
        {
            return keySet.Keys;
        }

        var client = httpClientFactory.CreateClient();
        var json = await client.GetStringAsync(jwksUrl);
        keySet = new JsonWebKeySet(json);
            
        // В продакшене здесь стоит добавить Expire Policy (например, MemoryCache),
        // чтобы обновлять ключи раз в сутки.
        _keyCache.TryAdd(jwksUrl, keySet);

        return keySet.Keys;
    }
}