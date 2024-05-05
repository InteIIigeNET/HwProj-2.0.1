using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using System.Linq;
using System.Net.Http;
using System.Web;
using AutoMapper;
using HwProj.AuthService.API.Extensions;
using HwProj.Models.Roles;
using HwProj.AuthService.API.Events;
using HwProj.AuthService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;
using HwProj.Utils.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Octokit;
using User = HwProj.Models.AuthService.ViewModels.User;


namespace HwProj.AuthService.API.Services
{
    public class AccountService : IAccountService
    {
        private readonly IUserManager _userManager;
        private readonly UserManager<User> _aspUserManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IAuthTokenService _tokenService;
        private readonly IEventBus _eventBus;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _client;
        private readonly IExpertsRepository _expertsRepository;

        public AccountService(IUserManager userManager,
            SignInManager<User> signInManager,
            IAuthTokenService authTokenService,
            IEventBus eventBus,
            IMapper mapper,
            UserManager<User> aspUserManager,
            IConfiguration configuration,
            IHttpClientFactory clientFactory,
            IExpertsRepository expertsRepository)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = authTokenService;
            _eventBus = eventBus;
            _mapper = mapper;
            _aspUserManager = aspUserManager;
            _configuration = configuration;
            _client = clientFactory.CreateClient();
            _expertsRepository = expertsRepository;
        }

        private async Task<AccountDataDto> GetAccountDataAsync(User user)
        {
            if (user == null) return null;
            var userRoles = await _userManager.GetRolesAsync(user);
            var userRole = userRoles.FirstOrDefault() ?? Roles.StudentRole;
            return user.ToAccountDataDto(userRole);
        }

        public async Task<AccountDataDto> GetAccountDataAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            return await GetAccountDataAsync(user);
        }

        public async Task<AccountDataDto[]> GetAccountsDataAsync(string[] userIds)
        {
            var users = await _aspUserManager.Users
                .Where(user => userIds.Contains(user.Id))
                .AsNoTracking()
                .ToDictionaryAsync(t => t.Id);

            var accounts = new AccountDataDto[userIds.Length];

            for (var i = 0; i < userIds.Length; i++)
            {
                var userId = userIds[i];
                if (!users.TryGetValue(userId, out var user)) continue;
                var roles = await _aspUserManager.GetRolesAsync(user);
                accounts[i] = user.ToAccountDataDto(roles.FirstOrDefault() ?? Roles.StudentRole);
            }

            return accounts;
        }

        public async Task<AccountDataDto> GetAccountDataByEmailAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            return await GetAccountDataAsync(user);
        }

        public async Task<Result> EditAccountAsync(string id, EditDataDTO model)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return Result.Failed("Пользователь не найден");
            }

            var result = await ChangeUserNameTask(user, model);

            return result.Succeeded ? Result.Success() : Result.Failed();
        }

        public async Task<Result<TokenCredentials>> LoginUserAsync(LoginViewModel model)
        {
            if (await _userManager.FindByEmailAsync(model.Email)
                    is var user && user == null)
            {
                return Result<TokenCredentials>.Failed("Пользователь не найден");
            }

            var result = await _signInManager.PasswordSignInAsync(
                user,
                model.Password,
                model.RememberMe,
                false).ConfigureAwait(false);

            if (!result.Succeeded)
            {
                return Result<TokenCredentials>.Failed(result.TryGetIdentityError());
            }

            var token = await _tokenService.GetTokenAsync(user);
            return Result<TokenCredentials>.Success(token);
        }

        public async Task<Result> LoginExpertAsync(TokenCredentials tokenCredentials)
        {
            var tokenClaims = _tokenService.GetTokenClaims(tokenCredentials);

            if (tokenClaims.Role != Roles.ExpertRole)
            {
                return Result.Failed("Невалидный токен: пользователь не является экспертом");
            }

            if (tokenClaims.Email is null)
            {
                return Result.Failed("Невалидный токен: пользователь не найден");
            }

            var expert = await _userManager.FindByEmailAsync(tokenClaims.Email);
            if (expert.Id != tokenClaims.Id)
            {
                return Result.Failed("Невалидный токен: пользователь не найден");
            }

            var tokenCredentialsResult = await _tokenService.GetExpertTokenAsync(expert);
            if (!tokenCredentialsResult.Succeeded)
            {
                return Result.Failed(tokenCredentialsResult.Errors);
            }

            if (tokenCredentials.AccessToken != tokenCredentialsResult.Value.AccessToken)
            {
                return Result.Failed("Невалидный токен");
            }
            
            await _signInManager.SignInAsync(expert, false).ConfigureAwait(false);
            return Result.Success();
        }

        public async Task<Result<TokenCredentials>> RefreshToken(string userId)
        {
            return await _userManager.FindByIdAsync(userId) is var user && user == null
                ? Result<TokenCredentials>.Failed("Пользователь не найден")
                : await GetToken(user);
        }

        public async Task<Result<TokenCredentials>> RegisterUserAsync(RegisterDataDTO model)
        {
            if (await _userManager.FindByEmailAsync(model.Email) != null)
            {
                return Result<TokenCredentials>.Failed("Пользователь уже зарегистрирован");
            }

            if (!model.IsExternalAuth && model.Password.Length < 6)
            {
                return Result<TokenCredentials>.Failed("Пароль должен содержать не менее 6 символов");
            }

            if (!model.IsExternalAuth && model.Password != model.PasswordConfirm)
            {
                return Result<TokenCredentials>.Failed("Пароли не совпадают");
            }

            var user = _mapper.Map<User>(model);
            user.UserName = user.Email;

            var createUserTask = model.IsExternalAuth
                ? _userManager.CreateAsync(user)
                : _userManager.CreateAsync(user, model.Password);

            var result = await createUserTask
                .Then(() => _userManager.AddToRoleAsync(user, Roles.StudentRole))
                .Then(() =>
                {
                    user.EmailConfirmed = true;
                    return _userManager.UpdateAsync(user);
                });

            if (result.Succeeded)
            {
                var newUser = await _userManager.FindByEmailAsync(model.Email).ConfigureAwait(false);
                var registerEvent = new StudentRegisterEvent(newUser.Id, newUser.Email, newUser.Name,
                    newUser.Surname, newUser.MiddleName);
                _eventBus.Publish(registerEvent);

                if (!model.IsExternalAuth)
                {
                    await SignIn(user, model.Password);
                }

                return await GetToken(user);
            }

            return Result<TokenCredentials>.Failed(result.Errors.Select(errors => errors.Description).ToArray());
        }

        public async Task<Result> RegisterExpertAsync(RegisterExpertViewModel model, string lecturerId)
        {
            if (await _userManager.FindByEmailAsync(model.Email) != null)
            {
                return Result.Failed("Пользователь уже зарегистрирован");
            }

            var user = _mapper.Map<User>(model);
            user.UserName = user.Email;

            var createUserTask = _userManager.CreateAsync(user);

            var result = await createUserTask
                .Then(() => _userManager.AddToRoleAsync(user, Roles.ExpertRole))
                .Then(() =>
                {
                    user.EmailConfirmed = true;
                    return _userManager.UpdateAsync(user);
                });

            return result.Succeeded
                ? Result.Success()
                : Result.Failed(result.Errors.Select(errors => errors.Description).ToArray());
        }

        public async Task<Result> InviteNewLecturer(string emailOfInvitedUser)
        {
            var invitedUser = await _userManager.FindByEmailAsync(emailOfInvitedUser).ConfigureAwait(false);

            if (invitedUser == null)
            {
                return Result.Failed("Пользователь не найден");
            }

            var result = await _userManager.AddToRoleAsync(invitedUser, Roles.LecturerRole)
                .Then(() => _userManager.RemoveFromRoleAsync(invitedUser, Roles.StudentRole)).ConfigureAwait(false);

            if (result.Succeeded)
            {
                var inviteEvent = new InviteLecturerEvent
                {
                    UserId = invitedUser.Id,
                    UserEmail = invitedUser.Email
                };
                _eventBus.Publish(inviteEvent);
                return Result.Success();
            }

            return Result.Failed("Пользователь уже является преподавателем");
        }

        public async Task<IList<User>> GetUsersInRole(string role)
        {
            return await _userManager.GetUsersInRoleAsync(role);
        }

        public async Task<User[]> GetExperts(string userId)
        {
            var expertIds = await _expertsRepository.GetExpertIds(userId);
            var experts = _aspUserManager.Users
                .Where(user => expertIds.Contains(user.Id))
                .AsNoTracking()
                .ToArray();

            return experts;
        }

        public async Task<Result> RequestPasswordRecovery(RequestPasswordRecoveryViewModel model)
        {
            var user = await _aspUserManager.FindByEmailAsync(model.Email);
            if (user == null) return Result.Failed("Пользователь не найден");

            var token = await _aspUserManager.GeneratePasswordResetTokenAsync(user);
            if (token == null) return Result.Failed("Произошла внутренняя ошибка");

            var passwordRecoveryEvent = new PasswordRecoveryEvent
            {
                UserId = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                Email = user.Email,
                Token = token
            };
            _eventBus.Publish(passwordRecoveryEvent);

            return Result.Success();
        }

        public async Task<Result> ResetPassword(ResetPasswordViewModel model)
        {
            var user = await _aspUserManager.FindByIdAsync(model.UserId);
            if (user == null) return Result.Failed("Пользователь не найден");

            if (model.Password.Length < 6)
            {
                return Result.Failed("Пароль должен содержать не менее 6 символов");
            }

            if (model.Password != model.PasswordConfirm)
            {
                return Result.Failed("Пароль и его подтверждение не совпадают");
            }

            var result = await _aspUserManager.ResetPasswordAsync(user, model.Token, model.Password);
            if (!result.Succeeded)
                return Result.Failed(string.Join(", ", result.Errors.Select(t => t.Description)));

            var removeTokenResult = await _aspUserManager.RemoveAuthenticationTokenAsync(user,
                _aspUserManager.Options.Tokens.PasswordResetTokenProvider,
                UserManager<User>.ResetPasswordTokenPurpose);

            return removeTokenResult.Succeeded
                ? Result.Success()
                : Result.Failed(string.Join(", ", removeTokenResult.Errors.Select(t => t.Description)));
        }

        public async Task<GithubCredentials> AuthorizeGithub(string code, string userId)
        {
            var sourceSettings = _configuration.GetSection("Github");
            
            var parameters = new Dictionary<string, string>
            {
                { "client_id", sourceSettings["ClientIdGithub"] },
                { "client_secret", sourceSettings["ClientSecretGithub"] },
                { "code", code },
            };

            var content = new FormUrlEncodedContent(parameters);

            var response = await _client.PostAsync("https://github.com/login/oauth/access_token", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            var values = HttpUtility.ParseQueryString(responseContent);
            var accessToken = values["access_token"];
            if (accessToken is null)
            {
                throw new InvalidOperationException("Ошибка при попытке авторизации");
            }

            var organizationName = sourceSettings["OrganizationNameGithub"];
            var githubClient = new GitHubClient(new ProductHeaderValue(organizationName));

            var tokenAuth = new Credentials(accessToken);
            githubClient.Credentials = tokenAuth;

            var user = await githubClient.User.Current();
            var login = user.Login;

            var userFromDb = await _userManager.FindByIdAsync(userId);

            if (!(login is null))
            {
                userFromDb.GitHubId = user.Login;

                await _userManager.UpdateAsync(userFromDb);
            }

            var githubCredentials = new GithubCredentials
            {
                GithubId = user.Login
            };

            return githubCredentials;
        }

        private Task<IdentityResult> ChangeUserNameTask(User user, EditDataDTO model)
        {
            if (!string.IsNullOrWhiteSpace(model.Name))
            {
                user.Name = model.Name;
            }

            if (!string.IsNullOrWhiteSpace(model.Surname))
            {
                user.Surname = model.Surname;
            }

            if (!string.IsNullOrWhiteSpace(model.MiddleName))
            {
                user.MiddleName = model.MiddleName;
            }

            return _userManager.UpdateAsync(user);
        }

        private async Task SignIn(User user, string password)
        {
            await _signInManager.PasswordSignInAsync(user, password, false, false)
                .ConfigureAwait(false);
        }

        private async Task<Result<TokenCredentials>> GetToken(User user)
        {
            return Result<TokenCredentials>.Success(await _tokenService.GetTokenAsync(user).ConfigureAwait(false));
        }
    }
}
