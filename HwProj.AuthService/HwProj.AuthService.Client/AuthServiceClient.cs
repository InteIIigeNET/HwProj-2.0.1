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
using System.Collections.Generic;

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

        public async Task<AccountSummaryDto> GetAccountSummary(string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + $"api/account/getUserSummary/{userId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<AccountSummaryDto>().ConfigureAwait(false);
        }

        public async Task<AccountDataDto> GetAccountDataByEmail(string email)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + $"api/account/getUserDataByEmail/{email}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<AccountDataDto>();
        }

        public async Task<AccountDataDto[]> GetAccountsData(string[] userIds)
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
            return await response.DeserializeAsync<AccountDataDto[]>();
        }

        public async Task<Result<string>> Register(RegisterViewModel model)
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
            return await response.DeserializeAsync<Result<string>>();
        }

        public async Task<Result<string>[]> GetOrRegisterStudentsBatchAsync(
            IEnumerable<RegisterViewModel> registrationModels)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + "api/account/registerStudentsBatch")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(registrationModels),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result<string>[]>();
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

        public async Task<Result<TokenCredentials>> RefreshToken(string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + $"api/account/refreshToken?userId={userId}");

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
            var user = await response.DeserializeAsync<AccountDataDto>();
            return user?.UserId;
        }

        public async Task<AccountDataDto[]> GetAllStudents()
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + "api/account/getAllStudents");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<AccountDataDto[]>().ConfigureAwait(false);
        }

        public async Task<AccountDataDto[]> GetAllLecturers()
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + "api/account/getAllLecturers");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<AccountDataDto[]>().ConfigureAwait(false);
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

        public async Task<Result> RequestPasswordRecovery(RequestPasswordRecoveryViewModel model)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + "api/account/requestPasswordRecovery")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode
                ? await response.DeserializeAsync<Result>()
                : Result.Failed(response.ReasonPhrase);
        }

        public async Task<Result> ResetPassword(ResetPasswordViewModel model)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + "api/account/resetPassword")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            return response.IsSuccessStatusCode
                ? await response.DeserializeAsync<Result>()
                : Result.Failed(response.ReasonPhrase);
        }

        public async Task<UrlDto> GetGithubLoginUrl(UrlDto urlDto)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + "api/account/github/url")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(urlDto),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);

            var result = await response.DeserializeAsync<UrlDto>();

            return result;
        }

        public async Task<GithubCredentials> AuthorizeGithub(string code, string userId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + $"api/account/github/authorize/{userId}?code={code}");

            var response = await _httpClient.SendAsync(httpRequest);

            return await response.DeserializeAsync<GithubCredentials>();
        }

        public async Task<Result> RegisterExpert(RegisterExpertViewModel model, string lecturerId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + $"api/Experts/register?lecturerId={lecturerId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(model),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result>();
        }

        public async Task<Result> LoginExpert(TokenCredentials credentials)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + "api/Experts/login")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(credentials),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result>();
        }

        public async Task<Result<TokenCredentials>> GetExpertToken(string expertEmail)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + $"api/Experts/getToken?expertEmail={expertEmail}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result<TokenCredentials>>();
        }

        public async Task<Result<bool>> GetIsExpertProfileEdited(string expertId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + $"api/Experts/isProfileEdited/{expertId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result<bool>>();
        }

        public async Task<Result> SetExpertProfileIsEdited(string expertId)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + $"api/Experts/setProfileIsEdited/{expertId}");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result>();
        }

        public async Task<ExpertDataDTO[]> GetAllExperts()
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                _authServiceUri + "api/Experts/getAll");

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<ExpertDataDTO[]>().ConfigureAwait(false);
        }

        public async Task<Result> UpdateExpertTags(string lecturerId, UpdateExpertTagsDTO updateExpertTagsDto)
        {
            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Post,
                _authServiceUri + $"api/Experts/updateTags?lecturerId={lecturerId}")
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(updateExpertTagsDto),
                    Encoding.UTF8,
                    "application/json")
            };

            var response = await _httpClient.SendAsync(httpRequest);
            return await response.DeserializeAsync<Result>();
        }
    }
}
