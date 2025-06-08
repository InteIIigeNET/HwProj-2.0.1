using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using System.Threading.Tasks;
using HwProj.Models.Result;
using System.Collections.Generic;

namespace HwProj.AuthService.Client
{
    public interface IAuthServiceClient
    {
        Task<AccountDataDto> GetAccountData(string userId);
        Task<AccountDataDto> GetAccountDataByEmail(string email);
        Task<AccountDataDto[]> GetAccountsData(string[] userId);
        Task<Result<string>> Register(RegisterViewModel model);
        Task<Result<TokenCredentials>> Login(LoginViewModel model);
        Task<Result<TokenCredentials>> RefreshToken(string userId);
        Task<Result> Edit(EditAccountViewModel model, string userId);
        Task<Result> InviteNewLecturer(InviteLecturerViewModel model);
        Task<string> FindByEmailAsync(string email);
        Task<AccountDataDto[]> GetAllStudents();
        Task<User[]> GetAllLecturers();
        Task<bool> Ping();
        Task<Result> RequestPasswordRecovery(RequestPasswordRecoveryViewModel model);
        Task<Result> ResetPassword(ResetPasswordViewModel model);
        Task<UrlDto> GetGithubLoginUrl(UrlDto redirectUrl);
        Task<GithubCredentials> AuthorizeGithub(string code, string userId);
        Task<Result> RegisterExpert(RegisterExpertViewModel model, string lecturerId);
        Task<Result> LoginExpert(TokenCredentials credentials);
        Task<Result<TokenCredentials>> GetExpertToken(string expertEmail);
        Task<Result<bool>> GetIsExpertProfileEdited(string expertId);
        Task<Result> SetExpertProfileIsEdited(string expertId);
        Task<ExpertDataDTO[]> GetAllExperts();
        Task<Result> UpdateExpertTags(string lecturerId, UpdateExpertTagsDTO updateExpertTagsDto);
        Task<Result<string>[]> GetOrRegisterStudentsBatchAsync(IEnumerable<RegisterViewModel> registrationModels);
        Task<Result<TokenCredentials>> GetStudentToken(string email);
        Task<Result> LoginWithToken(TokenCredentials credentials);
        Task<Result<string>> RegisterInvitedStudent(RegisterViewModel model);
        Task<Result<TokenValidationResult>> ValidateToken(TokenCredentials credentials);
    }
}
