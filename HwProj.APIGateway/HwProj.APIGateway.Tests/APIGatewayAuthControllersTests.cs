using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using AutoFixture;
using FluentAssertions;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace HwProj.APIGateway.Tests
{
    public class Tests
    {
        private HttpClient _noCookieClient;
        private HttpClient _cookieClient;
        private HttpClient _authServiceClient;
        private CookieContainer _cookieContainer;
        private const string _devPassword = "devPassword";

        [SetUp]
        public void Setup()
        {
            const string address = "http://localhost:5000";
            const string authServiceAddress = "http://localhost:5001";

            var handlerNoCookie = new HttpClientHandler()
            {
                UseCookies = false
            };

            _noCookieClient = new HttpClient(handlerNoCookie)
            {
                BaseAddress = new Uri(address)
            };

            _cookieContainer = new CookieContainer();
            var handlerWithCookie = new HttpClientHandler()
            {
                UseCookies = true,
                CookieContainer = _cookieContainer

            };

            _cookieClient = new HttpClient(handlerWithCookie)
            {
                BaseAddress = new Uri(address)
            };

            _authServiceClient = new HttpClient()
            {
                BaseAddress = new Uri(authServiceAddress)
            };
        }

        private Claim[] ValidateToken(string token)
        {
            const string secret = "U8_.wpvk93fPWG<f2$Op[vwegmQGF25_fNG2V0ijnm2e0igv24g";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var handler = new JwtSecurityTokenHandler();
            var validations = new TokenValidationParameters
            {
                ValidIssuer = "AuthService",
                ValidateIssuer = true,
                ValidateAudience = false,
                ValidateLifetime = true,
                IssuerSigningKey = key,
                ValidateIssuerSigningKey = true
            };
            var claims = handler.ValidateToken(token, validations, out var tokenSecure);

            return claims.Claims.ToArray();
        }

        private static RegisterViewModel GenerateRegisterViewModel()
        {
            var fixture = new Fixture().Build<RegisterViewModel>()
                .With(x => x.Email, new Fixture().Create<MailAddress>().Address);

            return fixture.Create();
        }

        private static LoginViewModel GenerateLoginViewModel(RegisterViewModel model)
            => new LoginViewModel
            {
                Email = model.Email,
                Password = _devPassword,
                RememberMe = false
            };

        private static LoginViewModel GenerateWrongLoginViewModel(RegisterViewModel model)
            => new LoginViewModel
            {
                Email = model.Email,
                Password = "wrongPassword",
                RememberMe = false
            };

        private static async Task<HttpResponseMessage> PostJsonAsync(HttpClient client, string url, object data)
        {
            var json = JsonConvert.SerializeObject(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            return await client.PostAsync(url, content);
        }

        private static async Task<HttpResponseMessage> GetJsonAsync(HttpClient client, string url)
            => await client.GetAsync(url);

        private static async Task<HttpResponseMessage> PutJsonAsync(HttpClient client, string url, object data)
        {
            var json = JsonConvert.SerializeObject(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            return await client.PutAsync(url, content);
        }

        private static async Task<T> ReadJsonAsync<T>(HttpResponseMessage response)
        {
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(json);
        }

        private static async Task<HttpResponseMessage> RetryUntilSuccess(Func<Task<HttpResponseMessage>> action)
        {
            var response = await action();
            for (int i = 0; i < 10; i++)
            {
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    break;
                }
                await Task.Delay(500);
                response = await action();
            }

            return response;
        }

        private static async Task ReadOkAsync(HttpResponseMessage response)
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var resultResponse = await ReadJsonAsync<Result>(response);
            resultResponse.Succeeded.Should().BeTrue();
        }

        private static async Task ReadOkAsync<T>(HttpResponseMessage response)
        {
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var resultResponse = await ReadJsonAsync<Result<T>>(response);
            resultResponse.Succeeded.Should().BeTrue();
        }

        [Test]
        public async Task LoginCorrectDataShouldSetCookie()
        {
            var user = GenerateRegisterViewModel();
            var registerResponse = await PostJsonAsync(_cookieClient, "/api/Account/register", user);
            await ReadOkAsync<string>(registerResponse);

            var loginData = GenerateLoginViewModel(user);
            var loginResponse = await RetryUntilSuccess(() => PostJsonAsync(_cookieClient, "/api/Account/login", loginData));

            loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            loginResponse.Headers.Contains("Set-Cookie").Should().BeTrue();
            var cookie = loginResponse.Headers.GetValues("Set-Cookie").First();
            cookie.Should().Contain("httponly");
        }

        [Test]
        public async Task LoginIncorrectDataShouldNotSetCookie()
        {
            var user = GenerateRegisterViewModel();
            var registerResponse = await PostJsonAsync(_cookieClient, "/api/Account/register", user);
            await ReadOkAsync<string>(registerResponse);

            var loginData = GenerateWrongLoginViewModel(user);
            var loginResponse = await PostJsonAsync(_cookieClient, "/api/Account/login", loginData);

            await Task.Delay(1000);

            loginResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            loginResponse.Headers.Contains("Set-Cookie").Should().BeFalse();
        }

        [Test]
        public async Task GetUserSummaryShouldReturnsUser()
        {
            var user = GenerateRegisterViewModel();
            var registerResponse = await PostJsonAsync(_cookieClient, "/api/Account/register", user);
            await ReadOkAsync<string>(registerResponse);

            var loginData = GenerateLoginViewModel(user);
            var loginResponse = await RetryUntilSuccess(() => PostJsonAsync(_cookieClient, "/api/Account/login", loginData));

            loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var summaryResponse = await GetJsonAsync(_cookieClient, "/api/Account/getUserSummary");
            var summary = await ReadJsonAsync<AccountSummaryDto>(summaryResponse);
            summary.Email.Should().Be(user.Email);
        }

        [Test]
        public async Task GetUserSummaryWithoutCookieShouldReturnsUnauthorized()
        {
            var user = GenerateRegisterViewModel();
            var registerResponse = await PostJsonAsync(_noCookieClient, "/api/Account/register", user);
            await ReadOkAsync<string>(registerResponse);

            var loginData = GenerateLoginViewModel(user);
            var loginResponse = await RetryUntilSuccess(() => PostJsonAsync(_cookieClient, "/api/Account/login", loginData));
            loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var response = await GetJsonAsync(_noCookieClient, "/api/Account/getUserSummary");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Test]
        public async Task LogoutShouldRemoveCookie()
        {
            var user = GenerateRegisterViewModel();
            var registerResponse = await PostJsonAsync(_cookieClient, "/api/Account/register", user);
            await ReadOkAsync<string>(registerResponse);

            var loginData = GenerateLoginViewModel(user);
            var loginResponse = await RetryUntilSuccess(() => PostJsonAsync(_cookieClient, "/api/Account/login", loginData));
            loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var logoutResponse = await PostJsonAsync(_cookieClient, "/api/Account/logout", null);

            var cookie = _cookieContainer.GetCookies(new Uri("http://localhost:5000"));
            var accessToken = cookie["accessToken"]?.Value;
            accessToken.Should().BeNull();

            var response = await GetJsonAsync(_cookieClient, "/api/Account/getUserSummary");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Test]
        public async Task RefreshTokenShouldSetValidToken()
        {
            var user = GenerateRegisterViewModel();
            var registerResponse = await PostJsonAsync(_cookieClient, "/api/Account/register", user);
            await ReadOkAsync<string>(registerResponse);

            var loginData = GenerateLoginViewModel(user);
            var loginResponse = await RetryUntilSuccess(() => PostJsonAsync(_cookieClient, "/api/Account/login", loginData));
            loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var newEmail = "new" + user.Email;
            var editModel = new EditAccountViewModel
            {
                Name = user.Name,
                Surname = user.Surname,
                Email = newEmail,
            };

            var editResponse = await PutJsonAsync(_cookieClient, "/api/Account/edit", editModel);
            await ReadOkAsync(editResponse);

            var beforeCookie = _cookieContainer.GetCookies(new Uri("http://localhost:5000"));
            var accessTokenBefore = beforeCookie["accessToken"]?.Value;

            var refreshResponse = await GetJsonAsync(_cookieClient, "/api/Account/refreshToken");
            refreshResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            refreshResponse.Headers.Contains("Set-Cookie").Should().BeTrue();

            var afterCookie = _cookieContainer.GetCookies(new Uri("http://localhost:5000"));
            var accessTokenAfter = afterCookie["accessToken"]?.Value;

            var tokenClaims = ValidateToken(accessTokenAfter);
            accessTokenBefore.Should().NotBe(accessTokenAfter);
            tokenClaims[2].Value.Should().Be(newEmail);
        }

        [Test]
        public async Task ExpertLoginShouldReturnExpectedResult()
        {
            var lecturerData = GenerateRegisterViewModel();
            var registerResponse = await PostJsonAsync(_cookieClient, "/api/Account/register", lecturerData);
            await ReadOkAsync<string>(registerResponse);

            var inviteLecturerModel = new InviteLecturerViewModel
            {
                Email = lecturerData.Email
            };

            var lecturerInviteResponse = await PostJsonAsync(_authServiceClient, "api/account/inviteNewLecturer", inviteLecturerModel);
            await ReadOkAsync(lecturerInviteResponse);

            var lecturerLoginData = GenerateLoginViewModel(lecturerData);
            var loginResponse = await RetryUntilSuccess(() => PostJsonAsync(_cookieClient, "/api/Account/login", lecturerLoginData));
            loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var email = "expertFrom" +  lecturerData.Email;
            var model = new RegisterExpertViewModel
            {
                Name = "expertFrom" + lecturerData.Name,
                Surname = "expertFrom" + lecturerData.Surname,
                Email = email
            };

            var registerExpertResponse = await PostJsonAsync(_cookieClient, $"api/Experts/register", model);
            await ReadOkAsync(registerExpertResponse);

            var getTokenResponse = await GetJsonAsync(_cookieClient, $"/api/Experts/getToken?expertEmail={email}");
            var tokenMeta = await ReadJsonAsync<Result<TokenCredentials>>(getTokenResponse);
            tokenMeta.Succeeded.Should().BeTrue();

            var logoutResponse = await PostJsonAsync(_cookieClient, "/api/Account/logout", null);

            var expertLoginResponse = await PostJsonAsync(_cookieClient, "/api/Experts/login", tokenMeta.Value);
            expertLoginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var cookie = expertLoginResponse.Headers.GetValues("Set-Cookie").First();
            expertLoginResponse.Headers.Contains("Set-Cookie").Should().BeTrue();
            cookie.Should().Contain("httponly");

            var protectedResponse = await PostJsonAsync(_cookieClient, "/api/Experts/SetProfileIsEdited", null);
            await ReadOkAsync(protectedResponse);
        }

        [Test]
        public async Task AuthorizedEndpointShouldRequireRole()
        {
            var user = GenerateRegisterViewModel();
            var registerResponse = await PostJsonAsync(_cookieClient, "/api/Account/register", user);
            await ReadOkAsync<string>(registerResponse);

            var loginData = GenerateLoginViewModel(user);
            var loginResponse = await RetryUntilSuccess(() => PostJsonAsync(_cookieClient, "/api/Account/login", loginData));
            loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var lecturerModel = new InviteLecturerViewModel
            {
                Email = "lecturer@mail.ru"
            };

            var summaryResponse = await GetJsonAsync(_cookieClient, "/api/Account/getUserSummary");
            var summary = await ReadJsonAsync<AccountSummaryDto>(summaryResponse);
            summary.Email.Should().Be(user.Email);

            var response = await PostJsonAsync(_cookieClient, "/api/Account/inviteNewLecturer", lecturerModel);
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        [TearDown]
        public void Dispose()
        {
            _noCookieClient.Dispose();
            _cookieClient.Dispose();
            _authServiceClient.Dispose();
        }
    }
}