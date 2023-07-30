using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using System.Linq;
using AutoMapper;
using Google.Apis.Auth;
using HwProj.AuthService.API.Extensions;
using HwProj.Models.Roles;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;

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

        public AccountService(IUserManager userManager,
            SignInManager<User> signInManager,
            IAuthTokenService authTokenService,
            IEventBus eventBus,
            IMapper mapper,
            UserManager<User> aspUserManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = authTokenService;
            _eventBus = eventBus;
            _mapper = mapper;
            _aspUserManager = aspUserManager;
        }

        public async Task<AccountDataDto> GetAccountDataAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId).ConfigureAwait(false);
            if (user == null)
            {
                return null;
            }

            var userRoles = await _userManager.GetRolesAsync(user).ConfigureAwait(false);
            var userRole = userRoles.FirstOrDefault() ?? Roles.StudentRole;
            return new AccountDataDto(user.Id, user.Name, user.Surname, user.Email, userRole, user.IsExternalAuth,
                user.MiddleName);
        }

        public async Task<Result> EditAccountAsync(string id, EditDataDTO model)
        {
            var user = await _userManager.FindByIdAsync(id).ConfigureAwait(false);
            if (user == null)
            {
                return Result.Failed("Пользователь не найден");
            }

            if (!user.IsExternalAuth && !await _userManager.CheckPasswordAsync(user, model.CurrentPassword))
            {
                return Result.Failed("Неправильный логин или пароль");
            }

            var result = user.IsExternalAuth
                ? await ChangeUserNameTask(user, model)
                : await ChangeUserNameTask(user, model).Then(() => ChangePasswordAsync(user, model));

            if (result.Succeeded)
            {
                return Result.Success();
            }

            return Result.Failed();
        }

        public async Task<Result<TokenCredentials>> LoginUserAsync(LoginViewModel model)
        {
            if (await _userManager.FindByEmailAsync(model.Email).ConfigureAwait(false)
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

            var token = await _tokenService.GetTokenAsync(user).ConfigureAwait(false);
            return Result<TokenCredentials>.Success(token);
        }

        public async Task<Result<TokenCredentials>> LoginUserByGoogleAsync(GoogleJsonWebSignature.Payload payload)
        {
            if (await _userManager.FindByEmailAsync(payload.Email).ConfigureAwait(false)
                    is var user && user == null)
            {
                var userModel = new RegisterDataDTO()
                {
                    Email = payload.Email,
                    Name = payload.GivenName,
                    Surname = payload.FamilyName,
                    IsExternalAuth = true
                };

                return await RegisterUserAsync(userModel);
            }

            return await GetToken(user);
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

            var user = _mapper.Map<User>(model);
            user.UserName = user.Email.Split('@')[0];

            var createUserTask = model.IsExternalAuth
                ? _userManager.CreateAsync(user)
                : _userManager.CreateAsync(user, model.Password);

            if (!model.IsExternalAuth && createUserTask.Result.Succeeded &&
                !await _userManager.CheckPasswordAsync(user, model.PasswordConfirm))
            {
                return Result<TokenCredentials>.Failed("Пароли не совпадают");
            }

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

        private Task<IdentityResult> ChangeUserNameTask(User user, EditDataDTO model)
        {
            if (!string.IsNullOrWhiteSpace(model.Name))
            {
                user.Name = model.Name;
            }

            if (!string.IsNullOrWhiteSpace(model.Name))
            {
                user.Surname = model.Surname;
            }

            if (!string.IsNullOrWhiteSpace(model.Name))
            {
                user.MiddleName = model.MiddleName;
            }

            return _userManager.UpdateAsync(user);
        }

        private Task<IdentityResult> ChangePasswordAsync(User user, EditDataDTO model)
        {
            return !string.IsNullOrWhiteSpace(model.NewPassword)
                ? _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword)
                : Task.FromResult(IdentityResult.Success);
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
