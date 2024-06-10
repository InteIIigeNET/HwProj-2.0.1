using System.Threading.Tasks;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;

namespace HwProj.AuthService.API.Services
{
    public interface IExpertsService
    {
        Task<Result> RegisterExpertAsync(RegisterExpertViewModel model, string lecturerId);
        Task<Result<bool>> GetIsExpertProfileEdited(string expertAccountId);
        Task<Result> SetExpertProfileIsEdited(string expertAccountId);
        Task<Result> LoginExpertAsync(TokenCredentials tokenCredentials);
        Task<ExpertDataDTO[]> GetAllExperts();
        Task<Result> UpdateExpertTags(string lecturerId, UpdateExpertTagsDTO updateExpertTagsDto);
    }
}