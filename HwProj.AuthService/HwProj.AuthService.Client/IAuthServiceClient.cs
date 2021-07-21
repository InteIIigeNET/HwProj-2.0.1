using System.Threading.Tasks;
using HwProj.AuthService.API.Models.DTO;
using HwProj.Models.AuthService;

namespace HwProj.AuthService.Client
{
    public interface IAuthServiceClient
    {
        Task<AccountDataDto> GetAccountData(string accountId);
    }
}
