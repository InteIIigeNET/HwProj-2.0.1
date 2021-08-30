using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using System.Linq;
using AutoMapper;
using Google.Apis.Auth;
using Google.Apis.Util;
using HwProj.AuthService.API.Extensions;
using HwProj.Models.Roles;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.AuthService.API.Models;

namespace HwProj.AuthService.API.Services
{
    public class AccountService : IAccountService
    {
        private readonly IUserManager _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IAuthTokenService _tokenService;
        private readonly IEventBus _eventBus;
        private readonly IMapper _mapper;

        public AccountService(IUserManager userManager,
            SignInManager<User> signInManager,
            IAuthTokenService authTokenService,
            IEventBus eventBus,
            IMapper mapper)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = authTokenService;
            _eventBus = eventBus;
            _mapper = mapper;
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
            return new AccountDataDto(user.Name, user.Surname, user.Email, userRole, user.IsExternalAuth, user.MiddleName);
        }

        public async Task<Result> EditAccountAsync(string id, EditDataDTO model)
        {
            var user = await _userManager.FindByIdAsync(id).ConfigureAwait(false);
            if (user == null)
            {
                return Result.Failed("User not found");
            }

            if (!user.IsExternalAuth && !await _userManager.CheckPasswordAsync(user, model.CurrentPassword))
            {
                return Result.Failed("Wrong current password");
            }

            var result = user.IsExternalAuth
                ? await ChangeUserNameTask(user, model)
                : await ChangeUserNameTask(user, model).Then(() => ChangePasswordAsync(user, model));

            if (result.Succeeded)
            {
                var editEvent = new EditEvent(id, model.Name,
                    model.Surname, model.MiddleName);
                _eventBus.Publish(editEvent);
                return Result.Success();
            }

            return Result.Failed();
        }

        public async Task<Result<TokenCredentials>> LoginUserAsync(LoginViewModel model)
        {
            if (await _userManager.FindByEmailAsync(model.Email).ConfigureAwait(false)
                    is var user && user == null)
            {
                return Result<TokenCredentials>.Failed("User not found");
            }

            if (!await _userManager.IsEmailConfirmedAsync(user).ConfigureAwait(false))
            {
                return Result<TokenCredentials>.Failed("Email not confirmed");
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
                return Result<TokenCredentials>.Failed("User exist");
            }

            var user = _mapper.Map<User>(model);
            user.UserName = user.Email.Split('@')[0];

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

        public async Task<Result> InviteNewLecturer(string emailOfInvitedUser)
        {
            var invitedUser = await _userManager.FindByEmailAsync(emailOfInvitedUser).ConfigureAwait(false);

            if (invitedUser == null)
            {
                return Result.Failed("User not found");
            }

            var result = await _userManager.AddToRoleAsync(invitedUser, Roles.LecturerRole)
                .Then(() => _userManager.RemoveFromRoleAsync(invitedUser, Roles.StudentRole)).ConfigureAwait(false);

            if (result.Succeeded)
            {
                var inviteEvent = new InviteLecturerEvent(invitedUser.Id);
                _eventBus.Publish(inviteEvent);
                return Result.Success();
            }

            return Result.Failed();
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
