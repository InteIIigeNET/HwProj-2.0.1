using HwProj.AuthService.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace HwProj.AuthService.API.Services
{
    public class ThirdPartyProviderService
    {
        private readonly UserManager<User> userManager;
        private readonly AppSettings appSettings;

        public ThirdPartyProviderService(UserManager<User> userManager,IOptions<AppSettings> appSettings)
        {
            this.userManager = userManager;
            this.appSettings = appSettings.Value;
        }

        public Uri GetSignInUriGithub()
        {
            const string authorizePath = "https://github.com/login/oauth/authorize";
            var signInUriBuilder = new UriBuilder(authorizePath);

            var parameters = HttpUtility.ParseQueryString(string.Empty);
            parameters["client_id"] = "724aadcc454b9ed5c1b1";
            parameters["scope"] = "user:email";
            signInUriBuilder.Query = parameters.ToString();

            return signInUriBuilder.Uri;
        }

        public async Task<string> GetTokenGitHub(string userCode)
        {
            const string accessTokenPath = "https://github.com/login/oauth/access_token";
            var getTokenUriBuilder = new UriBuilder(accessTokenPath);

            var parameters = HttpUtility.ParseQueryString(string.Empty);
            parameters["client_id"] = "724aadcc454b9ed5c1b1";
            parameters["client_secret"] = "5006166a27ce2c3d6477c3dd5ac79a3069f4f001";
            parameters["code"] = userCode;
            getTokenUriBuilder.Query = parameters.ToString();

            HttpResponseMessage response = null;

            using (var client = new HttpClient())
            {
                response = await client.GetAsync(getTokenUriBuilder.Uri);
            }

            return (await response.Content.ReadAsFormDataAsync()).GetValues("access_token").First();
        }

        public async Task<string> GetUserGitHub(string userCode)
        {
            const string userDataPath = "https://api.github.com/user";
            var token = await GetTokenGitHub(userCode);

            HttpResponseMessage response = null;

            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("Authorization", "Bearer " + token);
                client.DefaultRequestHeaders.Add("User-Agent", "my-agent");
                response = await client.GetAsync(userDataPath);
            }

            return await response.Content.ReadAsStringAsync();
        }
    }
}
