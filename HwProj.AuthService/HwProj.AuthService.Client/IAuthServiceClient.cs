using System.Threading.Tasks;
using HwProj.AuthService.API.Models.DTO;

namespace HwProj.AuthService.Client
{
    public interface IAuthServiceClient
    {
        Task<AccountDataDTO> GetAccountData(string accountId);
    }
}
