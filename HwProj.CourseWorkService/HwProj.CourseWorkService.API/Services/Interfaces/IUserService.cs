using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;

namespace HwProj.CourseWorkService.API.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserDTO[]> GetUsersByRoleAsync(Roles role);
        Task UpdateUserRoleProfile<TProfile, TProfileViewModel>(string userId, TProfileViewModel viewModel) 
            where TProfile : class, IProfile;
        Task InviteCuratorAsync(string email);
        Task<RoleDTO[]> GetUserRoles(string userId);
        Task<UserFullInfoDTO> GetUserFullInfo(string userId);
        Task AddReviewerRoleToUser(string userId);
        Task RemoveReviewerRole(string userId);
    }
}
