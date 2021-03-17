using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;

namespace HwProj.CourseWorkService.API.Services.Interfaces
{
    public interface IUniversityService
    {
        Task<DirectionDTO[]> GetDirectionsAsync();
        Task<long> AddDirectionAsync(AddDirectionViewModel directionViewModel);
        Task DeleteDirectionAsync(long directionId);
        Task<DepartmentDTO[]> GetDepartmentsAsync();
        Task<long> AddDepartmentAsync(AddDepartmentViewModel departmentViewModel);
        Task DeleteDepartmentAsync(long departmentId);
        Task<DeadlineDTO[]> GetCuratorDeadlines(string userId);
        Task<DeadlineDTO> GetChoiceThemeDeadlineAsync(string userId);
        Task<DeadlineDTO[]> GetCourseWorkDeadlinesAsync(string userId, long courseWorkId);
        Task<long> AddDeadlineAsync(string userId, AddDeadlineViewModel addDeadlineViewModel);
        Task DeleteDeadlineAsync(string userId, long deadlineId);
    }
}
