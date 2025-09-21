using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.Repositories;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Internal;
using User = HwProj.AuthService.API.Models.User;

namespace HwProj.AuthService.API.Services
{
    public class ExpertsService : IExpertsService
    {
        private readonly IUserManager _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IAuthTokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly IExpertsRepository _expertsRepository;

        public ExpertsService(IUserManager userManager,
            SignInManager<User> signInManager,
            IAuthTokenService authTokenService,
            IMapper mapper,
            IExpertsRepository expertsRepository)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = authTokenService;
            _mapper = mapper;
            _expertsRepository = expertsRepository;
        }

        public async Task<Result> RegisterExpertAsync(RegisterExpertViewModel model, string lecturerId)
        {
            if (await _userManager.FindByEmailAsync(model.Email) != null)
            {
                return Result.Failed("Пользователь уже зарегистрирован");
            }

            var user = _mapper.Map<User>(model);
            user.UserName = user.Email;

            var createUserResult = await _userManager.CreateAsync(user);
            if (!createUserResult.Succeeded)
            {
                return Result.Failed(createUserResult.Errors.Select(errors => errors.Description).ToArray());
            }

            var addToRoleResult = await _userManager.AddToRoleAsync(user, Roles.ExpertRole);
            if (!addToRoleResult.Succeeded)
            {
                return Result.Failed(addToRoleResult.Errors.Select(errors => errors.Description).ToArray());
            }

            user.EmailConfirmed = true;
            var updateUserResult = await _userManager.UpdateAsync(user);
            if (!updateUserResult.Succeeded)
            {
                return Result.Failed(updateUserResult.Errors.Select(errors => errors.Description).ToArray());
            }

            await _expertsRepository.AddAsync(new ExpertData
            {
                Id = user.Id,
                LecturerId = lecturerId,
                IsProfileEdited = false,
                Tags = model.Tags.Join(";")
            });

            return Result.Success();
        }

        public async Task<Result<bool>> GetIsExpertProfileEdited(string expertAccountId)
        {
            var expertData = await _expertsRepository.GetWithUserInfoAsync(expertAccountId);

            if (expertData == null)
            {
                return Result<bool>.Failed("Информация об эксперте не найдена");
            }

            return Result<bool>.Success(expertData.IsProfileEdited);
        }

        public async Task<Result> SetExpertProfileIsEdited(string expertAccountId)
        {
            var expertData = await _expertsRepository.GetWithUserInfoAsync(expertAccountId);

            if (expertData == null)
            {
                return Result.Failed("Информация об эксперте не найдена");
            }

            await _expertsRepository.UpdateAsync(expertAccountId, ed => new ExpertData
            {
                IsProfileEdited = true,
            });

            return Result.Success();
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

        public async Task<ExpertDataDTO[]> GetAllExperts()
        {
            var expertsFromDb = await _expertsRepository.GetAllWithUserInfoAsync();

            var result = expertsFromDb.Select(expertData => new ExpertDataDTO
                {
                    Id = expertData.Id,
                    Name = expertData.User.Name,
                    Surname = expertData.User.Surname,
                    MiddleName = expertData.User.MiddleName,
                    Bio = expertData.User.Bio,
                    CompanyName = expertData.User.CompanyName,
                    Email = expertData.User.Email,
                    Tags = expertData.Tags?.Split(';').ToList() ?? new List<string>(),
                    LecturerId = expertData.LecturerId
                })
                .ToArray();

            return result;
        }

        public async Task<Result> UpdateExpertTags(string lecturerId, UpdateExpertTagsDTO updateExpertTagsDto)
        {
            var expertData = await _expertsRepository.GetWithUserInfoAsync(updateExpertTagsDto.ExpertId);

            if (expertData.LecturerId != lecturerId)
            {
                return Result.Failed(
                    "Менять тэги эксперта может только преподаватель, зарегистрировавший этого эксперта");
            }

            await _expertsRepository.UpdateAsync(updateExpertTagsDto.ExpertId, data => new ExpertData()
            {
                Tags = updateExpertTagsDto.Tags.Join(";")
            });

            return Result.Success();
        }
    }
}