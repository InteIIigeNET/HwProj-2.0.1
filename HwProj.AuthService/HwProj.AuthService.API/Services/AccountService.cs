using HwProj.AuthService.API.Models;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using HwProj.AuthService.API.Models.ViewModels;
using System.Linq;
using AutoMapper;
using HwProj.AuthService.API.Extensions;
using HwProj.AuthService.API.Models.DTO;
using HwProj.Models.Roles;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;

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

        public async Task<AccountDataDTO> GetAccountDataAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId).ConfigureAwait(false);
            if (user == null)
            {
                return null;
            }

            var userRoles = await _userManager.GetRolesAsync(user).ConfigureAwait(false);
            var userRole = userRoles.FirstOrDefault() ?? Roles.StudentRole;
            return new AccountDataDTO(user.Name, user.Surname, user.Email, userRole, user.MiddleName);
        }

        public async Task<IdentityResult> EditAccountAsync(string id, EditAccountViewModel model)
        {
            var user = await _userManager.FindByIdAsync(id).ConfigureAwait(false);
            if (user == null)
            {
                return IdentityResults.UserNotFound;
            }

            if (!await _userManager.CheckPasswordAsync(user, model.CurrentPassword))
            {
                return IdentityResults.WrongPassword;
            }

            var result = await ChangeUserNameTask(user, model)
                .Then(() => ChangePasswordAsync(user, model))
                .ConfigureAwait(false);

            if (result.Succeeded)
            {
                var editEvent = new EditEvent(id, model.Name,
                    model.Surname, model.MiddleName);
                _eventBus.Publish(editEvent);
            }

            return result;
        }

        public async Task<IdentityResult<TokenCredentials>> LoginUserAsync(LoginViewModel model)
        {
            if (await _userManager.FindByEmailAsync(model.Email).ConfigureAwait(false)
                    is var user && user == null)
            {
                return IdentityResult<TokenCredentials>.Failed(IdentityErrors.UserNotFound);
            }

            if (!await _userManager.IsEmailConfirmedAsync(user).ConfigureAwait(false))
            {
                return IdentityResult<TokenCredentials>.Failed(IdentityErrors.EmailNotConfirmed);
            }

            var result = await _signInManager.PasswordSignInAsync(
                user,
                model.Password,
                model.RememberMe,
                false).ConfigureAwait(false);

            if (!result.Succeeded)
            {
                return IdentityResult<TokenCredentials>.Failed(result.TryGetIdentityError());
            }

            var token = await _tokenService.GetTokenAsync(user).ConfigureAwait(false);
            return IdentityResult<TokenCredentials>.Success(token);
        }

        public async Task<IdentityResult> RegisterUserAsync(RegisterViewModel model)
        {
            if (await _userManager.FindByEmailAsync(model.Email).ConfigureAwait(false) != null)
            {
                return IdentityResults.UserExists;
            }

            var user = _mapper.Map<User>(model);
            user.UserName = user.Email.Split('@')[0];

            var result = await _userManager.CreateAsync(user, model.Password)
                .Then(() => _userManager.AddToRoleAsync(user, Roles.StudentRole))
                .Then(() =>
                {
                    user.EmailConfirmed = true;
                    return _userManager.UpdateAsync(user);
                }).ConfigureAwait(false);

            if (result.Succeeded)
            {
                var newUser = await _userManager.FindByEmailAsync(model.Email).ConfigureAwait(false);
                var registerEvent = new StudentRegisterEvent(newUser.Id, newUser.Email, newUser.Name,
                    newUser.Surname, newUser.MiddleName);
                _eventBus.Publish(registerEvent);
            }

            return result;
        }

        public async Task<IdentityResult> InviteNewLecturer(string emailOfInvitedUser)
        {
            var invitedUser = await _userManager.FindByEmailAsync(emailOfInvitedUser).ConfigureAwait(false);

            if (invitedUser == null)
            {
                return IdentityResults.UserNotFound;
            }

            var result = await _userManager.AddToRoleAsync(invitedUser, Roles.LecturerRole)
                .Then(() => _userManager.RemoveFromRoleAsync(invitedUser, Roles.StudentRole)).ConfigureAwait(false);

            if (result.Succeeded)
            {
                var inviteEvent = new InviteLecturerEvent(invitedUser.Id);
                _eventBus.Publish(inviteEvent);
            }

            return result;
        }

        private Task<IdentityResult> ChangeUserNameTask(User user, EditAccountViewModel model)
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

        private Task<IdentityResult> ChangePasswordAsync(User user, EditAccountViewModel model)
        {
            return !string.IsNullOrWhiteSpace(model.NewPassword)
                ? _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword)
                : Task.FromResult(IdentityResult.Success);
        }
    }
}