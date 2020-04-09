using HwProj.AuthService.API.Models;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using HwProj.AuthService.API.Models.ViewModels;
using System.Linq;
using AutoMapper;
using HwProj.AuthService.API.Extensions;
using HwProj.AuthService.API.Models.DTO;
using HwProj.Models.Roles;
using System;

namespace HwProj.AuthService.API.Services
{
    public class AccountService : IAccountService
    {
        private readonly IUserManager _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IAuthTokenService _tokenService;
        private readonly IMapper _mapper;

        public AccountService(IUserManager userManager,
            SignInManager<User> signInManager,
            IAuthTokenService authTokenService,
            IMapper mapper)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = authTokenService;
            _mapper = mapper;
        }

        public async Task<AccountData> GetAccountDataAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId).ConfigureAwait(false);
            if (user == null)
            {
                return null;
            }

            var userRoles = await _userManager.GetRolesAsync(user).ConfigureAwait(false);
            var userRole = userRoles.FirstOrDefault() ?? Roles.StudentRole;
            return new AccountData(user.UserName, user.Email, userRole);
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

            return await ChangeUserNameTask(user, model).Then(() => ChangePasswordAsync(user, model)).ConfigureAwait(false);
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

            return await _userManager.CreateAsync(user, model.Password)
                .Then(() => _userManager.AddToRoleAsync(user, Roles.StudentRole))
                .Then(() =>
                {
                    user.EmailConfirmed = true;
                    return _userManager.UpdateAsync(user);
                }).ConfigureAwait(false);
        }

        public async Task<IdentityResult> InviteNewLecturer(string emailOfInvitedUser)
        {
            var invitedUser = await _userManager.FindByEmailAsync(emailOfInvitedUser).ConfigureAwait(false);

            if (invitedUser == null)
            {
                return IdentityResults.UserNotFound;
            }

            return await _userManager.AddToRoleAsync(invitedUser, Roles.LecturerRole)
                .Then(() => _userManager.RemoveFromRoleAsync(invitedUser, Roles.StudentRole)).ConfigureAwait(false);
        }

        private Task<IdentityResult> ChangeUserNameTask(User user, EditAccountViewModel model)
        {
            return !string.IsNullOrWhiteSpace(model.UserName)
                ? _userManager.UpdateAsync(user)
                : Task.FromResult(IdentityResult.Success);
        }

        private Task<IdentityResult> ChangePasswordAsync(User user, EditAccountViewModel model)
        {
            return !string.IsNullOrWhiteSpace(model.NewPassword)
                ? _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword)
                : Task.FromResult(IdentityResult.Success);
        }
    }
}