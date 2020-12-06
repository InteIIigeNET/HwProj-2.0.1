using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;

namespace HwProj.CourseWorkService.API.Services.Interfaces
{
    public interface IUniversityService
    {
        Task<DirectionDTO[]> GetDirectionsAsync();
        Task AddDirectionAsync(AddDirectionViewModel directionViewModel);
        Task DeleteDirectionAsync(long directionId);
        Task<DepartmentDTO[]> GetDepartmentsAsync();
        Task AddDepartmentAsync(AddDepartmentViewModel departmentViewModel);
        Task DeleteDepartmentAsync(long departmentId);
    }
}
