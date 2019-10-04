using System.Threading.Tasks;
using HwProj.AuthService.API.Models;

namespace HwProj.AuthService.Client
{
    public interface IAuthServiceClient
    {
        Task<AccountData> GetAccountData(string accountId);
    }
}
