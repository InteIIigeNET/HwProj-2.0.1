using HwProj.AuthService.API.Models;
using HwProj.Models.AuthService.DTO;

namespace HwProj.AuthService.API.Extensions
{
    public static class MappingExtensions
    {
        public static AccountDataDto ToAccountDataDto(this User user, string role)
        {
            return new AccountDataDto(
                user.Id,
                user.Name,
                user.Surname,
                user.Email,
                role,
                user.IsExternalAuth,
                user.MiddleName,
                user.GitHubId,
                user.CompanyName,
                user.Bio);
        }

        public static AccountSummaryDto ToAccountSummaryDto(this User user, string role)
        {
            return new AccountSummaryDto(
                user.Id,
                user.Email,
                role);
        }
    }
}
