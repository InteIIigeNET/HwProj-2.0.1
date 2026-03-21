using System;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Caching.Memory;
using System.Net.Http;
using System.Threading.Tasks;
using System.Collections.Generic;
using HwProj.APIGateway.API.Lti.Services;

public class LtiKeyService(IHttpClientFactory httpClientFactory, IMemoryCache keycMemoryCache) : ILtiKeyService
{

    public async Task<IEnumerable<SecurityKey>?> GetKeysAsync(string jwksUrl)
    {
        if (string.IsNullOrEmpty(jwksUrl))
        {
            return null;
        }

        if (keycMemoryCache.TryGetValue(jwksUrl, out JsonWebKeySet? keySet))
        {
            return keySet!.Keys;
        }

        try
        {
            var client = httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(30);

            using var response = await client.GetAsync(jwksUrl);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            keySet = new JsonWebKeySet(json);

            if (response.Headers.CacheControl?.NoCache == true ||
                response.Headers.CacheControl?.NoStore == true ||
                response.Headers.CacheControl?.Private == true)
            {
                return keySet.Keys;
            }

            const int ageByDefault = 24;
            var cacheDuration = TimeSpan.FromHours(ageByDefault);

            if (response.Headers.CacheControl?.MaxAge.HasValue == true)
            {
                cacheDuration = response.Headers.CacheControl.MaxAge.Value;
            }

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(cacheDuration)
                .SetPriority(CacheItemPriority.High); //Не нужно же удалять первым при нехватке памяти?

            keycMemoryCache.Set(jwksUrl, keySet, cacheOptions);

            return keySet.Keys;
        }
        catch
        {
            return null;
        }
    }
}