using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using AutoFixture;
using Castle.Core.Internal;
using HwProj.AuthService.Client;
using HwProj.Models.AuthService.ViewModels;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Moq;
using NUnit.Framework;
using FluentAssertions;
using Google.Apis.Auth.AspNetCore;
using Google.Apis.Auth.OAuth2;
using HwProj.Models.AuthService.DTO;
using HwProj.Utils.Authorization;

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
        
        private static InviteLecturerViewModel GenerateInviteNewLecturerViewModel(RegisterViewModel model)
            => new InviteLecturerViewModel
            {
                Email = model.Email
            };

        private static AccountDataDto GenerateAccountDataDto(RegisterViewModel model)
            => new AccountDataDto(model.Name, 
                model.Surname,
                model.Email,
                "Student",
                false,
                model.MiddleName);
        
        private static User GenerateUser(RegisterViewModel model)
            => new User
            {
                Name = model.Name,
                Surname = model.Surname,
                MiddleName = model.MiddleName,
                IsExternalAuth = false
            };

        private IAuthServiceClient _authServiceClient;
        
        [SetUp]
        public void SetUp()
        {
            _authServiceClient = CreateAuthServiceClient();
        }
        
        [Test]
        public async Task TestRegisterUser()
        {
            var userData = GenerateRegisterViewModel();
            var registerResult = await _authServiceClient.Register(userData);
            
            registerResult.Succeeded.Should().BeTrue();
            registerResult.Errors.IsNullOrEmpty().Should().BeTrue();
            registerResult.Value.AccessToken.IsNullOrEmpty().Should().BeFalse();

            var userId = await _authServiceClient.FindByEmailAsync(userData.Email);
            var resultData = await _authServiceClient.GetAccountData(userId);

            resultData.Name.Should().Be(userData.Name);
            resultData.Surname.Should().Be(userData.Surname);
            resultData.MiddleName.Should().Be(userData.MiddleName);
            resultData.Email.Should().Be(userData.Email);
            resultData.Role.Should().Be("Student");
            resultData.IsExternalAuth.Should().BeFalse();
        }

        [Test]
        public async Task TestLoginUser()
        {
            var userData = GenerateRegisterViewModel();
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
            claims.Identity.IsAuthenticated.Should().BeTrue();
            var x = claims.Claims.ToList();

            var y = 10;
        }
        
        [Test]
        public async Task TestEditPassword()
        {
            var userData = GenerateRegisterViewModel();
            var authClient = CreateAuthServiceClient();
            await authClient.Register(userData);

            var editData = GenerateEditViewModel(userData);
            var userId = await authClient.FindByEmailAsync(userData.Email);
            var resultData = await authClient.Edit(editData, userId);
            
            resultData.Succeeded.Should().BeTrue();
            resultData.Errors.IsNullOrEmpty().Should().BeTrue();
        }
        
        [Test]
        public async Task TestInviteNewLecturer()
        {
            var userData = GenerateRegisterViewModel();
            var authClient = CreateAuthServiceClient();
            await authClient.Register(userData);

            var inviteLecturerData = GenerateInviteNewLecturerViewModel(userData);
            var resultData = await authClient.InviteNewLecturer(inviteLecturerData);
            
            resultData.Succeeded.Should().BeTrue();
            resultData.Errors.IsNullOrEmpty().Should().BeTrue();
        }

        // Google ?? 
        
        // EditExternal ??
    
        [Test]
        public async Task TestFindByEmail()
        {
            var userData = GenerateRegisterViewModel();
            var authClient = CreateAuthServiceClient();
            await authClient.Register(userData);

            var userId = await authClient.FindByEmailAsync(userData.Email);

            userId.IsNullOrEmpty().Should().BeFalse();
        }
        
        [Test]
        public async Task TestGetAllStudents()
        {
            var userData = GenerateRegisterViewModel();
            var authClient = CreateAuthServiceClient();
            await authClient.Register(userData);

            var allStudents = await authClient.GetAllStudents();

            var a = 10;
            
            // allStudents.Should().Contain(GenerateAccountDataDto(userData)); ?? 
            foreach (var student in allStudents)
            {
                student.Role.Should().Be("Student");
            }
        }

        [Test]
        public async Task TestGetAllLecturers()
        {
            var userData = GenerateRegisterViewModel();
            var authClient = CreateAuthServiceClient();
            await authClient.Register(userData);

            var allStudents = await authClient.GetAllLecturers();
            var a = 10;
            a.Should().BePositive();
            
            //allStudents.Should().Contain(GenerateUser(userData));
        }
    }
}
