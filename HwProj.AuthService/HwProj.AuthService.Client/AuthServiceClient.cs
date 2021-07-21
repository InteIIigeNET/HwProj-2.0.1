using System;
using System.Net.Http;
using System.Threading.Tasks;
using HwProj.AuthService.API.Models.ViewModels;
using HwProj.HttpUtils;
using HwProj.Models.AuthService;
using Microsoft.AspNetCore.Identity.UI.V3.Pages.Account.Internal;
using Microsoft.AspNetCore.Mvc;
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
        
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + "api/account/register");
            
                httpRequest.Content = new StringContent(JsonConvert.SerializeObject(model));

            var response = await _httpClient.SendAsync(httpRequest);
            var data = await response.DeserializeAsync<IActionResult>().ConfigureAwait(false);
            return data;
        }
        
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + "api/account/login");
            
            httpRequest.Content = new StringContent(JsonConvert.SerializeObject(model));

            var response = await _httpClient.SendAsync(httpRequest);
            var data = await response.DeserializeAsync<IActionResult>().ConfigureAwait(false);
            return data;
        }
    }
}
