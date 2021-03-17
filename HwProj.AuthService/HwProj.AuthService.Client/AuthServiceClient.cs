using System;
using System.Net.Http;
using System.Threading.Tasks;
using HwProj.AuthService.API.Models.DTO;
using HwProj.Utils.HttpUtils;

namespace HwProj.AuthService.Client
{
    public class AuthServiceClient : IAuthServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly Uri _authServiceUri;

        public AuthServiceClient(HttpClient httpClient, Uri authServiceUri)
        {
            _httpClient = httpClient;
            _authServiceUri = authServiceUri;
        }

        public async Task<AccountDataDTO> GetAccountData(string userId)
        {
            var uri = new RequestUrlBuilder(_authServiceUri)
                .AppendToPath("getUserData")
                .AppendToQuery("userId", userId)
                .Build();

            var response = await _httpClient.GetAsync(uri).ConfigureAwait(false);
            var data = await response.DeserializeAsync<AccountDataDTO>().ConfigureAwait(false);
            return data;
        }
    }
}