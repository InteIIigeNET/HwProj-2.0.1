using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using HwProj.HttpUtils;
using HwProj.Models.AuthService;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.AuthService.DTO;
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
            return await response.DeserializeAsync<AccountDataDto>().ConfigureAwait(false);
        }

        public async Task<Result<TokenCredentials>> Register(RegisterViewModel model)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + "api/account/register")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };
            
            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result<TokenCredentials>>();
        }

        public async Task<Result<TokenCredentials>> Login(LoginViewModel model)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + "api/account/login")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };
            
            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result<TokenCredentials>>();
        }
        
        public async Task<Result> Edit(EditAccountViewModel model, string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Put,
                _authServiceUri + $"api/account/edit/{userId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };
            
            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result>();
        }
        
        public async Task<Result> InviteNewLecturer(InviteLecturerViewModel model)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + "api/account/inviteNewLecturer")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };
            
            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result>();
        }
        
        public async Task<Result<TokenCredentials>> LoginByGoogle(string tokenId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + $"api/account/google/{tokenId}");
            
            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result<TokenCredentials>>();;
        }
        
        public async Task<Result<TokenCredentials>> LoginByGithub(string tokenId)
        {

            // Get the GitHub user
            var request = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenId);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Add("User-Agent", "HwProj/1");
            
            var response = await _httpClient.SendAsync(request);
            var result = await response.DeserializeAsync<RegisterViewModel>();
            var Mike = 20;
            return null;
        }
    }
}
