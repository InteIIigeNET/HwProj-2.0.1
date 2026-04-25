using System;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Caching.Memory;
using System.Net.Http;
using System.Threading.Tasks;
using System.Collections.Generic;
using HwProj.APIGateway.API.Lti.Services;

public class LtiKeyService(IHttpClientFactory httpClientFactory, IMemoryCache keycMemoryCache) : ILtiKeyService
{

    private const int ageByDefault = 24;

    public async Task<IEnumerable<SecurityKey>?> GetKeysAsync(string jwksUrl)
    {
        if (string.IsNullOrEmpty(jwksUrl))
        {
            return null;
        }

        if (keycMemoryCache.TryGetValue(jwksUrl, out JsonWebKeySet? keySet))
        {
            return keySet?.Keys;
        }

        try
        {
            var client = httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(30);

            using var response = await client.GetAsync(jwksUrl);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            keySet = new JsonWebKeySet(json);

            var cacheControl = response.Headers.CacheControl;
            if (cacheControl?.NoCache == true ||
                cacheControl?.NoStore == true ||
                cacheControl?.Private == true)
            {
                return keySet.Keys;
            }

            var cacheDuration = TimeSpan.FromHours(ageByDefault);

            if (cacheControl?.MaxAge.HasValue == true)
            {
                cacheDuration = cacheControl.MaxAge.Value;
            }

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(cacheDuration)
                .SetPriority(CacheItemPriority.High);

            keycMemoryCache.Set(jwksUrl, keySet, cacheOptions);

            return keySet.Keys;
        }
        catch
        {
            return null;
        }
    }
}