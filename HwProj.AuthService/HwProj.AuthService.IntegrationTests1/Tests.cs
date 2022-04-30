using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using AutoFixture;
using Castle.Core.Internal;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Moq;
using Xunit;
using Xunit.Abstractions;

namespace HwProj.AuthService.IntegrationTests
{
    public class Tests
    {
        private AuthServiceClient CreateAuthServiceClient()
        {
            var mockIConfiguration = new Mock<IConfiguration>();
            mockIConfiguration
                .Setup(x => x.GetSection("Services")["Auth"])
                .Returns("http://localhost:5001");

            var mockClientFactory = new Mock<IHttpClientFactory>();
            mockClientFactory
                .Setup(x => x.CreateClient(Options.DefaultName))
                .Returns(new HttpClient());

            return new AuthServiceClient(mockClientFactory.Object, mockIConfiguration.Object);
        }

        private static RegisterViewModel GenerateRegisterViewModel()
        {
            var password = new Fixture().Create<string>();

            var fixture = new Fixture().Build<RegisterViewModel>()
                .With(x => x.Email, new Fixture().Create<MailAddress>().Address)
                .With(x => x.Password, password)
                .With(x => x.PasswordConfirm, password);

            return fixture.Create();
        }

        private static LoginViewModel GenerateLoginViewModel(RegisterViewModel model)
            => new LoginViewModel
            {
                Email = model.Email,
                Password = model.Password,
                RememberMe = false
            };

        private static EditAccountViewModel GenerateEditViewModel(RegisterViewModel model)
            => new EditAccountViewModel
            {
                Name = model.Name,
                Surname = model.Surname,
                MiddleName = model.MiddleName,
                CurrentPassword = model.Password,
                NewPassword = new Fixture().Create<string>()
            };

        public static IEnumerable<object[]> DummyRegisterData()
        {
            yield return new object[] { GenerateRegisterViewModel() };
            yield return new object[] { GenerateRegisterViewModel() };
            yield return new object[] { GenerateRegisterViewModel() } ;
            yield return new object[] { GenerateRegisterViewModel() };
        }

        [Theory]
        [MemberData(nameof(DummyRegisterData))]
        public async void TestRegisterUser(RegisterViewModel userData)
        {
            var authClient = CreateAuthServiceClient();
            var registerResult = await authClient.Register(userData);
            
            Assert.True(registerResult.Succeeded);
            Assert.True(registerResult.Errors.IsNullOrEmpty());
            Assert.False(registerResult.Value.AccessToken.IsNullOrEmpty());

            var userId = await authClient.FindByEmailAsync(userData.Email);
            var resultData = await authClient.GetAccountData(userId);

            Assert.Equal(userData.Name, resultData.Name);
            Assert.Equal(userData.Surname, resultData.Surname);
            Assert.Equal(userData.MiddleName, resultData.MiddleName);
            Assert.Equal(userData.Email, resultData.Email);
            Assert.Equal("Student", resultData.Role);
            Assert.False(resultData.IsExternalAuth);
        }
        
        [Theory]
        [MemberData(nameof(DummyRegisterData))]
        public async void TestLoginUser(RegisterViewModel userData)
        {
            var authClient = CreateAuthServiceClient();
            await authClient.Register(userData);

            var loginData = GenerateLoginViewModel(userData);
            var resultData = await authClient.Login(loginData);
            
            string secret = "this is a string used for encrypt and decrypt token"; 
            var key = Encoding.ASCII.GetBytes(secret);
            var handler = new JwtSecurityTokenHandler();
            var validations = new TokenValidationParameters
            {
                ValidIssuer = "AuthService",
                ValidateIssuer = true,
                ValidateAudience = false,
                ValidateLifetime = true,
                IssuerSigningKey = AuthorizationKey.SecurityKey,
                ValidateIssuerSigningKey = true
            };
            var claims = handler.ValidateToken(resultData.Value.AccessToken, validations, out var tokenSecure);
            Assert.True(claims.Identity.IsAuthenticated);
        }
        
        [Theory]
        [MemberData(nameof(DummyRegisterData))]
        public async void TestEditPassword(RegisterViewModel userData)
        {
            var authClient = CreateAuthServiceClient();
            await authClient.Register(userData);

            var editData = GenerateEditViewModel(userData);
            var userId = await authClient.FindByEmailAsync(userData.Email);
            var resultData = await authClient.Edit(editData, userId);
            
            Assert.True(resultData.Succeeded);
            Assert.True(resultData.Errors.IsNullOrEmpty());
        }
    }
}
