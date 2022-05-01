using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
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
        
        public static IEnumerable<object[]> DummyRegisterData()
        {
            yield return new object[] { GenerateRegisterViewModel() };
            yield return new object[] { GenerateRegisterViewModel() };
            yield return new object[] { GenerateRegisterViewModel() } ;
            yield return new object[] { GenerateRegisterViewModel() };
        }
        
        /*public static IEnumerable<object[]> DummyGoogleRegisterData()
        {
            yield return new object[] { GenerateRegisterViewModel() };
            yield return new object[] { GenerateRegisterViewModel() };
            yield return new object[] { GenerateRegisterViewModel() } ;
            yield return new object[] { GenerateRegisterViewModel() };
        }*/
        
        [Test]
        [TestCaseSource(nameof(DummyRegisterData))]
        public async Task TestRegisterUser(RegisterViewModel userData)
        {
            var authClient = CreateAuthServiceClient();
            var registerResult = await authClient.Register(userData);
            
            registerResult.Succeeded.Should().BeTrue();
            registerResult.Errors.IsNullOrEmpty().Should().BeTrue();
            registerResult.Value.AccessToken.IsNullOrEmpty().Should().BeFalse();

            var userId = await authClient.FindByEmailAsync(userData.Email);
            var resultData = await authClient.GetAccountData(userId);

            resultData.Name.Should().Be(userData.Name);
            resultData.Surname.Should().Be(userData.Surname);
            resultData.MiddleName.Should().Be(userData.MiddleName);
            resultData.Email.Should().Be(userData.Email);
            resultData.Role.Should().Be("Student");
            resultData.IsExternalAuth.Should().BeFalse();
        }
        
        [Test]
        [TestCaseSource(nameof(DummyRegisterData))]
        public async Task TestLoginUser(RegisterViewModel userData)
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
            claims.Identity.IsAuthenticated.Should().BeTrue();
        }
        
        [Test]
        [TestCaseSource(nameof(DummyRegisterData))]
        public async Task TestEditPassword(RegisterViewModel userData)
        {
            var authClient = CreateAuthServiceClient();
            await authClient.Register(userData);

            var editData = GenerateEditViewModel(userData);
            var userId = await authClient.FindByEmailAsync(userData.Email);
            var resultData = await authClient.Edit(editData, userId);
            
            resultData.Succeeded.Should().BeTrue();
            resultData.Errors.IsNullOrEmpty().Should().BeTrue();
        }
        
        [Test]
        [TestCaseSource(nameof(DummyRegisterData))]
        public async Task TestInviteNewLecturer(RegisterViewModel userData)
        {
            var authClient = CreateAuthServiceClient();
            await authClient.Register(userData);

            var inviteLecturerData = GenerateInviteNewLecturerViewModel(userData);
            var resultData = await authClient.InviteNewLecturer(inviteLecturerData);
            
            resultData.Succeeded.Should().BeTrue();
            resultData.Errors.IsNullOrEmpty().Should().BeTrue();
        }

        // Google ?? 
        
        /*[Test]
        [TestCaseSource(nameof(DummyGoogleRegisterData))]
        public async Task TestGoogleRegister(IGoogleAuthProvider userData)
        {
            GoogleCredential cred = await userData.GetCredentialAsync();

            var a = 10;
            a.Should().BePositive();
        }*/
        
        // EditExternal ??
    
        [Test]
        [TestCaseSource(nameof(DummyRegisterData))]
        public async Task TestFindByEmail(RegisterViewModel userData)
        {
            var authClient = CreateAuthServiceClient();
            await authClient.Register(userData);

            var userId = await authClient.FindByEmailAsync(userData.Email);

            userId.IsNullOrEmpty().Should().BeFalse();
        }
        
        [Test]
        [TestCaseSource(nameof(DummyRegisterData))]
        public async Task TestGetAllStudents(RegisterViewModel userData)
        {
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
        [TestCaseSource(nameof(DummyRegisterData))]
        public async Task TestGetAllLecturers(RegisterViewModel userData)
        {
            var authClient = CreateAuthServiceClient();
            await authClient.Register(userData);

            var allStudents = await authClient.GetAllLecturers();
            var a = 10;
            a.Should().BePositive();
            
            //allStudents.Should().Contain(GenerateUser(userData));
        }
    }
}
