using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoFixture;
using HwProj.AuthService.Client;
using HwProj.Models.AuthService.ViewModels;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Moq;
using NUnit.Framework;
using FluentAssertions;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using HwProj.Utils.Auth;

namespace HwProj.AuthService.IntegrationTests
{
    public class Tests
    {
        private Claim[] ValidateToken(Result<TokenCredentials> resultData)
        {
            const string secret = "this is a string used for encrypt and decrypt token";
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

            return claims.Claims.ToArray();
        }

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

        private static EditAccountViewModel GenerateEditAccountViewModel(RegisterViewModel model)
            => new EditAccountViewModel
            {
                Name = new Fixture().Create<string>(),
                Surname = new Fixture().Create<string>(),
                MiddleName = new Fixture().Create<string>(),
                CurrentPassword = model.Password,
                NewPassword = model.Password
            };

        private static InviteLecturerViewModel GenerateInviteNewLecturerViewModel(RegisterViewModel model)
            => new InviteLecturerViewModel
            {
                Email = model.Email
            };

        private static AccountDataDto GenerateAccountDataDto(RegisterViewModel model)
            => new AccountDataDto(Guid.NewGuid().ToString(), model.Name,
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
            registerResult.Errors.Should().BeNullOrEmpty();
            registerResult.Value.AccessToken.Should().NotBeNullOrEmpty();

            var userId = await _authServiceClient.FindByEmailAsync(userData.Email);
            var resultData = await _authServiceClient.GetAccountData(userId);

            resultData.Should().BeEquivalentTo(userData, options =>
                options.ExcludingMissingMembers());
            resultData.Role.Should().Be(Roles.StudentRole);
        }

        [Test]
        public async Task UserAlreadyExistRegisterTest()
        {
            var userData = GenerateRegisterViewModel();
            var registerResult = await _authServiceClient.Register(userData);

            registerResult.Succeeded.Should().BeTrue();
            registerResult.Errors.Should().BeNullOrEmpty();
            registerResult.Value.AccessToken.Should().NotBeNullOrEmpty();

            var secondRegisterResult = await _authServiceClient.Register(userData);

            secondRegisterResult.Succeeded.Should().BeFalse();
            secondRegisterResult.Errors.Should()
                .BeEquivalentTo("Пользователь уже зарегистрирован");

            secondRegisterResult.Value.Should().BeNull();
        }

        [Test]
        public async Task WrongLengthPasswordRegisterTest()
        {
            var userData = GenerateRegisterViewModel();
            userData.Password = userData.Password.Substring(0, 5);
            var registerResult = await _authServiceClient.Register(userData);

            registerResult.Succeeded.Should().BeFalse();
            registerResult.Errors.Should()
                .BeEquivalentTo("Пароль должен содержать не менее 6 символов");
            registerResult.Value.Should().BeNull();
        }

        [Test]
        public async Task PasswordsDoNotMatchRegisterTest()
        {
            var userData = GenerateRegisterViewModel();
            userData.PasswordConfirm = new Fixture().Create<MailAddress>().Address;
            var registerResult = await _authServiceClient.Register(userData);

            registerResult.Succeeded.Should().BeFalse();
            registerResult.Errors.Should()
                .BeEquivalentTo("Пароли не совпадают");
            registerResult.Value.Should().BeNull();
        }

        [Test]
        public async Task TestLoginUser()
        {
            var userData = GenerateRegisterViewModel();
            await _authServiceClient.Register(userData);

            var loginData = GenerateLoginViewModel(userData);
            var resultData = await _authServiceClient.Login(loginData);

            resultData.Succeeded.Should().BeTrue();
            resultData.Errors.Should().BeNullOrEmpty();
            resultData.Value.AccessToken.Should().NotBeNullOrEmpty();

            var claims = ValidateToken(resultData);
            var userId = await _authServiceClient.FindByEmailAsync(userData.Email);

            claims[1].Value.Should().Be(userId);
            claims[2].Value.Should().Be(userData.Email);
            claims[3].Value.Should().Be(Roles.StudentRole);
        }

        [Test]
        public async Task UserIsNotExistLoginTest()
        {
            var userData = GenerateRegisterViewModel();
            var loginData = GenerateLoginViewModel(userData);

            var loginResult = await _authServiceClient.Login(loginData);

            loginResult.Succeeded.Should().BeFalse();
            loginResult.Errors.Should()
                .BeEquivalentTo("Пользователь не найден");
            loginResult.Value.Should().BeNull();
        }

        [Test]
        public async Task WrongPasswordLoginTest()
        {
            var userData = GenerateRegisterViewModel();
            await _authServiceClient.Register(userData);

            var loginData = GenerateLoginViewModel(userData);
            loginData.Password = new Fixture().Create<string>();
            var resultData = await _authServiceClient.Login(loginData);

            resultData.Succeeded.Should().BeFalse();
            resultData.Errors.Should()
                .BeEquivalentTo("Неправильный логин или пароль");
            resultData.Value.Should().BeNull();
        }

        [Test]
        public async Task WrongEmailLoginTest()
        {
            var userData = GenerateRegisterViewModel();
            await _authServiceClient.Register(userData);

            var loginData = GenerateLoginViewModel(userData);
            loginData.Email = new Fixture().Create<MailAddress>().Address;
            var resultData = await _authServiceClient.Login(loginData);

            resultData.Succeeded.Should().BeFalse();
            resultData.Errors.Should()
                .BeEquivalentTo("Пользователь не найден");
            resultData.Value.Should().BeNull();
        }

        [Test]
        public async Task TestEditAccountData()
        {
            var userData = GenerateRegisterViewModel();
            await _authServiceClient.Register(userData);

            var editData = GenerateEditAccountViewModel(userData);
            var userId = await _authServiceClient.FindByEmailAsync(userData.Email);
            var result = await _authServiceClient.Edit(editData, userId);

            result.Succeeded.Should().BeTrue();
            result.Errors.Should().BeNullOrEmpty();

            var resultData = await _authServiceClient.GetAccountData(userId);

            resultData.Should().BeEquivalentTo(editData, options =>
                options.ExcludingMissingMembers());
        }

        [Test]
        public async Task TestEditPassword()
        {
            var userData = GenerateRegisterViewModel();
            await _authServiceClient.Register(userData);

            var editData = GenerateEditViewModel(userData);
            var userId = await _authServiceClient.FindByEmailAsync(userData.Email);
            var resultData = await _authServiceClient.Edit(editData, userId);

            resultData.Succeeded.Should().BeTrue();
            resultData.Errors.Should().BeNullOrEmpty();

            var loginData = GenerateLoginViewModel(userData);
            var failedResult = await _authServiceClient.Login(loginData);

            failedResult.Succeeded.Should().BeFalse();
            failedResult.Errors.Should()
                .BeEquivalentTo("Неправильный логин или пароль");

            loginData.Password = editData.NewPassword;
            var result = await _authServiceClient.Login(loginData);

            result.Succeeded.Should().BeTrue();
            result.Errors.Should().BeNullOrEmpty();
        }

        [Test]
        public async Task EditAccountDataForUserThatDoesNotExistTest()
        {
            var userData = GenerateRegisterViewModel();
            var editData = GenerateEditAccountViewModel(userData);
            var userId = new Fixture().Create<string>();

            var result = await _authServiceClient.Edit(editData, userId);

            result.Succeeded.Should().BeFalse();
            result.Errors.Should()
                .BeEquivalentTo("Пользователь не найден");
        }

        [Test]
        public async Task EditAccountDataForUserWithWrongCurrentPasswordTest()
        {
            var userData = GenerateRegisterViewModel();
            await _authServiceClient.Register(userData);
            var editData = GenerateEditAccountViewModel(userData);
            editData.CurrentPassword = new Fixture().Create<string>();
            var userId = await _authServiceClient.FindByEmailAsync(userData.Email);

            var result = await _authServiceClient.Edit(editData, userId);

            result.Succeeded.Should().BeFalse();
            result.Errors.Should()
                .BeEquivalentTo("Неправильный логин или пароль");
        }

        [Test]
        public async Task TestInviteNewLecturer()
        {
            var userData = GenerateRegisterViewModel();
            await _authServiceClient.Register(userData);

            var inviteLecturerData = GenerateInviteNewLecturerViewModel(userData);
            var resultData = await _authServiceClient.InviteNewLecturer(inviteLecturerData);

            resultData.Succeeded.Should().BeTrue();
            resultData.Errors.Should().BeNullOrEmpty();

            var userId = await _authServiceClient.FindByEmailAsync(userData.Email);
            var newUserData = await _authServiceClient.GetAccountData(userId);

            newUserData.Role.Should().Be(Roles.LecturerRole);
        }

        [Test]
        public async Task TestInviteNewLecturerForUserThatDoesNotExist()
        {
            var userData = GenerateRegisterViewModel();
            var inviteLecturerData = GenerateInviteNewLecturerViewModel(userData);

            var resultData = await _authServiceClient.InviteNewLecturer(inviteLecturerData);

            resultData.Succeeded.Should().BeFalse();
            resultData.Errors.Should()
                .BeEquivalentTo("Пользователь не найден");
        }

        [Test]
        public async Task TestInviteNewLecturerForUserThatAlreadyLecturer()
        {
            var userData = GenerateRegisterViewModel();
            await _authServiceClient.Register(userData);

            var inviteLecturerData = GenerateInviteNewLecturerViewModel(userData);
            var resultData = await _authServiceClient.InviteNewLecturer(inviteLecturerData);

            resultData.Succeeded.Should().BeTrue();
            resultData.Errors.Should().BeNullOrEmpty();

            var result = await _authServiceClient.InviteNewLecturer(inviteLecturerData);

            result.Succeeded.Should().BeFalse();
            result.Errors.Should()
                .BeEquivalentTo("Пользователь уже является преподавателем");
        }

        [Test]
        public async Task TestFindByEmail()
        {
            var userData = GenerateRegisterViewModel();
            await _authServiceClient.Register(userData);

            var userId = await _authServiceClient.FindByEmailAsync(userData.Email);

            userId.Should().NotBeNullOrEmpty();
        }

        [Test]
        public async Task TestFindByEmailForUserThatDoesNotExist()
        {
            var userData = GenerateRegisterViewModel();

            var userId = await _authServiceClient.FindByEmailAsync(userData.Email);

            userId.Should().BeNullOrEmpty();
        }

        [Test]
        public async Task TestGetAllStudents()
        {
            var firstUser = GenerateRegisterViewModel();
            var secondUser = GenerateRegisterViewModel();

            var firstResult = await _authServiceClient.Register(firstUser);
            var secondResult = await _authServiceClient.Register(secondUser);

            firstResult.Succeeded.Should().BeTrue();
            secondResult.Succeeded.Should().BeTrue();

            var allStudents = await _authServiceClient.GetAllStudents();

            allStudents.Should().ContainEquivalentOf(firstUser, options =>
                options.ExcludingMissingMembers());
            allStudents.Should().ContainEquivalentOf(secondUser, options =>
                options.ExcludingMissingMembers());

            var firstLecturerData = GenerateInviteNewLecturerViewModel(firstUser);
            var secondLecturerData = GenerateInviteNewLecturerViewModel(secondUser);
            var firstLecturer = await _authServiceClient.InviteNewLecturer(firstLecturerData);
            var secondLecturer = await _authServiceClient.InviteNewLecturer(secondLecturerData);

            firstLecturer.Succeeded.Should().BeTrue();
            secondLecturer.Succeeded.Should().BeTrue();

            var newStudents = await _authServiceClient.GetAllStudents();

            newStudents.Should().NotContainEquivalentOf(firstUser, options =>
                options.ExcludingMissingMembers());
            newStudents.Should().NotContainEquivalentOf(secondUser, options =>
                options.ExcludingMissingMembers());
        }

        [Test]
        public async Task TestGetAllLecturers()
        {
            var firstUser = GenerateRegisterViewModel();
            var secondUser = GenerateRegisterViewModel();

            var firstResult = await _authServiceClient.Register(firstUser);
            var secondResult = await _authServiceClient.Register(secondUser);

            firstResult.Succeeded.Should().BeTrue();
            secondResult.Succeeded.Should().BeTrue();

            var allLecturers = await _authServiceClient.GetAllLecturers();

            allLecturers.Should().NotContainEquivalentOf(firstUser, options =>
                options.ExcludingMissingMembers());
            allLecturers.Should().NotContainEquivalentOf(secondUser, options =>
                options.ExcludingMissingMembers());

            var firstLecturerData = GenerateInviteNewLecturerViewModel(firstUser);
            var secondLecturerData = GenerateInviteNewLecturerViewModel(secondUser);
            var firstLecturer = await _authServiceClient.InviteNewLecturer(firstLecturerData);
            var secondLecturer = await _authServiceClient.InviteNewLecturer(secondLecturerData);

            firstLecturer.Succeeded.Should().BeTrue();
            secondLecturer.Succeeded.Should().BeTrue();

            var newLecturers = await _authServiceClient.GetAllLecturers();

            newLecturers.Should().ContainEquivalentOf(firstUser, options =>
                options.ExcludingMissingMembers());
            newLecturers.Should().ContainEquivalentOf(secondUser, options =>
                options.ExcludingMissingMembers());
        }

        [Test]
        public async Task TestGetAccountData()
        {
            var userData = GenerateRegisterViewModel();
            await _authServiceClient.Register(userData);

            var userId = await _authServiceClient.FindByEmailAsync(userData.Email);
            var resultData = await _authServiceClient.GetAccountData(userId);

            resultData.Should().BeEquivalentTo(userData, options =>
                options.ExcludingMissingMembers());
        }

        [Test]
        public async Task TestGetAccountDataForUserThatDoesNotExist()
        {
            var resultData = await _authServiceClient.GetAccountData(new Fixture().Create<string>());

            resultData.Should().BeNull();
        }

        [Test]
        public async Task TestGetPasswordResetTokenForUserThatDoesNotExist()
        {
            var result =
                await _authServiceClient.RequestPasswordRecovery(
                    new Fixture().Create<RequestPasswordRecoveryViewModel>());
            Assert.False(result.Succeeded);
            Assert.AreEqual("Пользователь не найден", result.Errors.First());
        }

        [Test]
        public async Task TestSetNewPasswordForUserThatDoesNotExist()
        {
            var password = new Fixture().Create<string>();
            var model = new ResetPasswordViewModel
            {
                UserId = new Fixture().Create<string>(),
                Password = password,
                PasswordConfirm = password,
                Token = new Fixture().Create<string>()
            };
            var result = await _authServiceClient.ResetPassword(model);
            Assert.False(result.Succeeded);
            Assert.AreEqual("Пользователь не найден", result.Errors.First());
        }

        [Test]
        public async Task TestSetNewPasswordWrongToken()
        {
            var userRegisterModel = GenerateRegisterViewModel();
            var result = await _authServiceClient.Register(userRegisterModel);
            result.Succeeded.Should().BeTrue();
            var userId = await _authServiceClient.FindByEmailAsync(userRegisterModel.Email);
            var password = new Fixture().Create<string>();
            var model = new ResetPasswordViewModel
            {
                UserId = userId,
                Password = password,
                PasswordConfirm = password,
                Token = new Fixture().Create<string>()
            };
            var resetResult = await _authServiceClient.ResetPassword(model);
            Assert.False(resetResult.Succeeded);
            Assert.AreEqual("Invalid token.", resetResult.Errors.First());
        }
    }
}
