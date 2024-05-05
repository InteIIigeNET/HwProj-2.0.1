using System.Threading.Tasks;
using HwProj.AuthService.API.Models;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Repositories;

namespace HwProj.AuthService.API.Repositories
{
    public interface IExpertsRepository : ICrudRepository<ExpertData, string>
    {
        public Task<string[]> GetExpertIds(string lecturerId);
    }
}