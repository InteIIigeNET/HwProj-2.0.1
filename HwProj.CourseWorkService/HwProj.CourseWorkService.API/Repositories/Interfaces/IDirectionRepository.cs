using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories.Interfaces
{
    public interface IDirectionRepository : ICrudRepository<Direction, long>
    {
        Task<Direction[]> GetDirectionsAsync();
    }
}
