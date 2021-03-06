using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Models.ViewModels;

namespace HwProj.CourseWorkService.API.Services.Interfaces
{
	public interface IViewModelService
	{
		Application GetApplicationFromViewModel(string userId, long courseWorkId,
			CreateApplicationViewModel createApplicationViewModel);
		StudentApplicationDTO GetStudentApplicationDTO(Application application);
		LecturerApplicationDTO GetLecturerApplicationDTO(Application application);
		OverviewApplicationDTO GetOverviewApplicationDTO(Application application);

		Task<CourseWork> GetCourseWorkFromViewModel(CreateCourseWorkViewModel createCourseWorkViewModel,
			string userId, bool createdByCurator);
		Task<OverviewCourseWorkDTO> GetCourseWorkOverviewDTO(CourseWork courseWork);
		Task<ReviewerOverviewCourseWorkDTO> GetReviewerOverviewCourseWorkDTO(CourseWork courseWork);
		Task<DetailCourseWorkDTO> GetCourseWorkDetailDTO(CourseWork courseWork);
		WorkFileDTO GetWorkFileDTO(WorkFile workFile);

		Direction GetDirectionFromViewModel(AddDirectionViewModel directionViewModel);
		Department GetDepartmentFromViewModel(AddDepartmentViewModel departmentViewModel);
		Deadline GetDeadlineFromViewModel(AddDeadlineViewModel deadlineViewModel, string userId);
		DirectionDTO GetDirectionDTO(Direction direction);
		DepartmentDTO GetDepartmentDTO(Department department);
		DeadlineDTO GetDeadlineDTO(Deadline deadline);

		UserDTO GetUserDTO(User user);

		RoleDTO GetRoleDTO(Role role);

		Task<UserFullInfoDTO> GetUserFullInfoDTO(User user);
	}
}
