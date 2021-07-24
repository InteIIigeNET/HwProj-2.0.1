using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using HwProj.HttpUtils;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.AuthService.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;

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

        public async Task<AccountDataDto> GetAccountData(string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + $"api/account/getUserData/{userId}");

            var response = await _httpClient.SendAsync(httpRequest);
            var data = await response.DeserializeAsync<AccountDataDto>().ConfigureAwait(false);
            return data;
        }
        
        public async Task<Result<TokenCredentials>> Register(RegisterViewModel model)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + "api/account/register");
            
                httpRequest.Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result<TokenCredentials>>();
        }

        private async Task<Result<TokenCredentials>> DeserializeResponse(HttpResponseMessage response)
        {
            return await response.DeserializeAsync<Result<TokenCredentials>>();
        }
        
        public async Task<Result<TokenCredentials>> Login(LoginViewModel model)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + "api/account/login");
            
            httpRequest.Content = new StringContent(
                JsonConvert.SerializeObject(model),
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result<TokenCredentials>>();
        }
    }
}
