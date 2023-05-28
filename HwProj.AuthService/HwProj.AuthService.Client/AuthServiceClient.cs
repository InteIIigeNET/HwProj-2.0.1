using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using HwProj.HttpUtils;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.AuthService.DTO;
using Newtonsoft.Json;
using HwProj.Models.Result;
using Microsoft.Extensions.Configuration;

namespace HwProj.AuthService.Client
{
    public class AuthServiceClient : IAuthServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly Uri _authServiceUri;

        public AuthServiceClient(IHttpClientFactory clientFactory, IConfiguration configuration)
        {
            _httpClient = clientFactory.CreateClient();
            _authServiceUri = new Uri(configuration.GetSection("Services")["Auth"]);
        }

        public async Task<AccountDataDto> GetAccountData(string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + $"api/account/getUserData/{userId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<AccountDataDto>().ConfigureAwait(false);
        }

        public async Task<AccountDataDto?[]> GetAccountsData(string[] userIds)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + "api/account/getUsersData")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(userIds),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<AccountDataDto?[]>();
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
            return await response.DeserializeAsync<Result<TokenCredentials>>();
            ;
        }

        public async Task<Result> EditExternal(EditExternalViewModel model, string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Put,
                _authServiceUri + $"api/account/editExternal/{userId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };
            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result>();
        }

        public async Task<string> FindByEmailAsync(string email)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + $"api/account/findByEmail/{email}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(email),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            var user = await response.DeserializeAsync<User>();
            return user?.Id;
        }

        public async Task<AccountDataDto[]> GetAllStudents()
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + "api/account/getAllStudents");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<AccountDataDto[]>().ConfigureAwait(false);
        }

        public async Task<User[]> GetAllLecturers()
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + "api/account/getAllLecturers");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<User[]>().ConfigureAwait(false);
        }

        public async Task<bool> Ping()
        {
            try
            {
                await _httpClient.GetAsync(_authServiceUri + "api/system/ping");
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<string> ResetPassword(string email)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + $"api/account/resetPassword")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(email),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            if (!response.IsSuccessStatusCode) throw new Exception(response.ReasonPhrase);
            return await response.Content.ReadAsStringAsync();
        }
    }
}
