using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FluentAssertions;
using HwProj.AuthService.API;
using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.Services;
using HwProj.Models.Roles;
using Moq;
using NUnit.Framework;

namespace HwProj.AuthService.Tests.UnitTests
{
    [TestFixture]
    public class TokenServiceTests
    {
        [SetUp]
        public void SetUp()
        {
            _userManagerMock = new Mock<IUserManager>();
            _authTokenService = new AuthTokenService(_userManagerMock.Object, _appSettings);
        }

        [Description("Проверяем claims, содержащиеся в токене")]
        [TestCase(Roles.StudentRole, Description = "Токен студента")]
        [TestCase(Roles.LecturerRole, Description = "Токен преподавателя")]
        [TestCase(null, Description = "Токен по умолчанию")]
        public async Task TokenClaimsTest(string userRole)
        {
            _userManagerMock
                .Setup(t => t.GetRolesAsync(It.IsAny<User>()))
                .ReturnsAsync(new List<string> {userRole});

            var tokenHandler = new JwtSecurityTokenHandler();

            var tokenCredentials = await _authTokenService.GetTokenAsync(_user);
            var tokenData = tokenHandler.ReadJwtToken(tokenCredentials.AccessToken);

            tokenData.Claims.Take(4).Should().BeEquivalentTo(
                new Claim("_userName", _user.UserName),
                new Claim("_id", _user.Id),
                new Claim("_email", _user.Email),
                new Claim("_role", userRole ?? Roles.StudentRole)
            );
        }

        private AuthTokenService _authTokenService;
        private Mock<IUserManager> _userManagerMock;

        private readonly AppSettings _appSettings = new AppSettings
        {
            SecurityKey = "U9_.wpvk93fPWG<f2$Op[vwegmQGF25_fNG2V0ijnm2e0igv24g",
            ExpireInForResponse = 30,
            ExpireInForToken = 30
        };

        private readonly User _user = new User
        {
            Id = "1",
            UserName = "Alex",
            Email = "user@mail.com"
        };
    }
}