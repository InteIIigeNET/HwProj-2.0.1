using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.API.Extensions;
using HwProj.AuthService.API.Repositories;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Internal;

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


            var createUserTask = _userManager.CreateAsync(user);

            var result = await createUserTask
                .Then(() => _userManager.AddToRoleAsync(user, Roles.ExpertRole))
                .Then(() =>
                {
                    user.EmailConfirmed = true;
                    return _userManager.UpdateAsync(user);
                });

            if (result.Succeeded)
            {
                await _expertsRepository.AddAsync(new ExpertData
                {
                    Id = user.Id,
                    LecturerId = lecturerId,
                    Tags = model.Tags.Join(";")
                });

                return Result.Success();
            }

            return Result.Failed(result.Errors.Select(errors => errors.Description).ToArray());
        }

        public async Task<Result<bool>> GetIsExpertProfileEdited(string expertAccountId)
        {
            var expertData = await _expertsRepository.GetAsync(expertAccountId);

            if (expertData == null)
            {
                return Result<bool>.Failed("Информация об эксперте не найдена");
            }

            return Result<bool>.Success(expertData.IsProfileEdited);
        }

        public async Task<Result> SetExpertProfileIsEdited(string expertAccountId)
        {
            var expertData = await _expertsRepository.GetAsync(expertAccountId);

            if (expertData == null)
            {
                return Result.Failed("Информация об эксперте не найдена");
            }

            await _expertsRepository.UpdateAsync(expertAccountId, ed => new ExpertData
            {
                Id = ed.Id,
                IsProfileEdited = true,
                LecturerId = ed.LecturerId
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
            var users = await _userManager.GetUsersInRoleAsync(Roles.ExpertRole);
            var expertsFromDb = _expertsRepository.GetAll().ToArray();

            var result = expertsFromDb.Join(
                    users,
                    expertData => expertData.Id,
                    user => user.Id,
                    (expertData, user) => new ExpertDataDTO
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Surname = user.Surname,
                        MiddleName = user.MiddleName,
                        Bio = user.Bio,
                        CompanyName = user.CompanyName,
                        Email = user.Email,
                        Tags = expertData.Tags?.Split(';').ToList() ?? new List<string>(),
                        LecturerId = expertData.LecturerId
                    })
                .ToArray();

            return result;
        }

        public async Task<Result> UpdateExpertTags(string lecturerId, UpdateExpertTagsDTO updateExpertTagsDto)
        {
            var expertData = await _expertsRepository.GetAsync(updateExpertTagsDto.ExpertId);

            if (expertData.LecturerId != lecturerId)
            {
                return Result.Failed(
                    "Менять тэги эксперта может только преподаватель, зарегистрировавший этого эксперта");
            }

            await _expertsRepository.UpdateAsync(updateExpertTagsDto.ExpertId, data => new ExpertData()
            {
                Id = data.Id,
                IsProfileEdited = data.IsProfileEdited,
                LecturerId = data.LecturerId,
                Tags = updateExpertTagsDto.Tags.Join(";")
            });

            return Result.Success();
        }
    }
}