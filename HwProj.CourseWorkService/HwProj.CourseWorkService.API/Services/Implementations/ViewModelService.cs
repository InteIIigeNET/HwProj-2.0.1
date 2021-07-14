using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Interfaces;

namespace HwProj.CourseWorkService.API.Services.Implementations
{
	public class ViewModelService : IViewModelService
	{
		#region Fields: Private

		private readonly IDeadlineRepository _deadlineRepository;
		private readonly IDepartmentRepository _departmentRepository;
		private readonly IDirectionRepository _directionRepository;
		private readonly IUsersRepository _usersRepository;
		private readonly IMapper _mapper;

		#endregion

		#region Constructors: Public

		public ViewModelService(IDeadlineRepository deadlineRepository,
			IDepartmentRepository departmentRepository, IDirectionRepository directionRepository,
			IUsersRepository usersRepository, IMapper mapper)
		{
			_deadlineRepository = deadlineRepository;
			_departmentRepository = departmentRepository;
			_directionRepository = directionRepository;
			_usersRepository = usersRepository;
			_mapper = mapper;
		}

		#endregion

        #region Methods: Public

        #region Application

        public Application GetApplicationFromViewModel(string userId, long courseWorkId,
	        CreateApplicationViewModel createApplicationViewModel)
        {
	        var application = _mapper.Map<Application>(createApplicationViewModel);
	        application.Date = DateTime.UtcNow;
	        application.StudentProfileId = userId;
	        application.CourseWorkId = courseWorkId;
	        return application;
        }

        public StudentApplicationDTO GetStudentApplicationDTO(Application application)
        {
	        var studentApplication = _mapper.Map<StudentApplicationDTO>(application);
	        studentApplication.CourseWorkTitle = application.CourseWork.Title;
	        studentApplication.CourseWorkOverview = application.CourseWork.Overview;
	        studentApplication.CourseWorkSupervisorName = application.CourseWork.SupervisorName;
	        return studentApplication;
        }
        public LecturerApplicationDTO GetLecturerApplicationDTO(Application application)
        {
	        var lecturerApplication = _mapper.Map<LecturerApplicationDTO>(application);
	        lecturerApplication.CourseWorkTitle = application.CourseWork.Title;
	        lecturerApplication.CourseWorkOverview = application.CourseWork.Overview;
	        lecturerApplication.StudentName = application.StudentProfile.User.UserName;
	        lecturerApplication.StudentGroup = application.StudentProfile.Group ?? default;
	        return lecturerApplication;
        }
        public OverviewApplicationDTO GetOverviewApplicationDTO(Application application)
        {
	        var overviewApplication = _mapper.Map<OverviewApplicationDTO>(application);
	        overviewApplication.CourseWorkTitle = application.CourseWork.Title;
	        overviewApplication.StudentName = application.StudentProfile.User.UserName;
	        overviewApplication.StudentGroup = application.StudentProfile.Group ?? default;
	        return overviewApplication;
        }

		#endregion

		#region CourseWorks

		public async Task<CourseWork> GetCourseWorkFromViewModel(CreateCourseWorkViewModel createCourseWorkViewModel,
	        string userId, bool createdByCurator)
        {
	        var courseWork = _mapper.Map<CourseWork>(createCourseWorkViewModel);
	        if (createdByCurator)
	        {
		        courseWork.CreatedByCurator = true;
	        }
	        else
	        {
		        var user = await _usersRepository.GetUserAsync(userId).ConfigureAwait(false);
		        courseWork.SupervisorName = user.UserName;
		        courseWork.SupervisorContact = courseWork.SupervisorContact ?? user.LecturerProfile?.Contact;
	        }

	        courseWork.CreationTime = DateTime.UtcNow;
	        courseWork.LecturerProfileId = userId;
	        return courseWork;
        }

		public async Task<OverviewCourseWorkDTO> GetCourseWorkOverviewDTO(CourseWork courseWork)
        {
            var courseWorkDTO = _mapper.Map<OverviewCourseWorkDTO>(courseWork);

            var student = await _usersRepository.GetAsync(courseWork.StudentProfileId).ConfigureAwait(false);
            courseWorkDTO.StudentName = student?.UserName ?? "";

            return courseWorkDTO;
        }

		public async Task<ReviewerOverviewCourseWorkDTO> GetReviewerOverviewCourseWorkDTO(CourseWork courseWork)
		{
			var overviewDTO = await GetCourseWorkOverviewDTO(courseWork).ConfigureAwait(false);
			var reviewerCourseWorkDTO = _mapper.Map<ReviewerOverviewCourseWorkDTO>(overviewDTO);

			var deadlines = await _deadlineRepository
				.FindAllDeadlines(d =>
					d.DeadlineTypeId == (long) DeadlineTypes.Bidding
					&& d.CuratorProfileId == courseWork.CuratorProfileId
					&& (d.CourseWorkId == courseWork.Id || d.CourseWorkId == null))
				.ConfigureAwait(false);
			var deadline = deadlines.FirstOrDefault(d => d.CourseWorkId == courseWork.Id)
			               ?? deadlines.FirstOrDefault(d => d.CourseWorkId == null);
			reviewerCourseWorkDTO.BiddingDeadline = deadline?.Date.ToString(CultureInfo.CurrentCulture);

			return reviewerCourseWorkDTO;
		}

		public async Task<DetailCourseWorkDTO> GetCourseWorkDetailDTO(CourseWork courseWork)
        {
            var detailCourseWorkDTO = _mapper.Map<DetailCourseWorkDTO>(courseWork);
            var reviewer = await _usersRepository.GetAsync(courseWork.ReviewerProfileId).ConfigureAwait(false);
            var student = await _usersRepository.GetUserAsync(courseWork.StudentProfileId).ConfigureAwait(false);

            detailCourseWorkDTO.ReviewerName = reviewer?.UserName ?? "";
            detailCourseWorkDTO.StudentName = student?.UserName ?? "";
            detailCourseWorkDTO.StudentCourse = student?.StudentProfile.Course ?? 0;
            return detailCourseWorkDTO;
        }
		public WorkFileDTO GetWorkFileDTO(WorkFile workFile)
        {
            var workFileDTO = _mapper.Map<WorkFileDTO>(workFile);
            workFileDTO.FileTypeName = workFile.FileType.DisplayValue;
            return workFileDTO;
        }

		#endregion

		#region University

		public Direction GetDirectionFromViewModel(AddDirectionViewModel directionViewModel)
		{
			var direction = _mapper.Map<Direction>(directionViewModel);
			direction.CuratorProfileId = directionViewModel.CuratorId;
			return direction;
		}
		public Department GetDepartmentFromViewModel(AddDepartmentViewModel departmentViewModel)
		{
			var department = _mapper.Map<Department>(departmentViewModel);
			return department;
		}
		public Deadline GetDeadlineFromViewModel(AddDeadlineViewModel deadlineViewModel, string userId)
		{
			var deadline = _mapper.Map<Deadline>(deadlineViewModel);
			deadline.CuratorProfileId = userId;
			return deadline;
		}

		public DirectionDTO GetDirectionDTO(Direction direction)
        {
	        var directionDTO = _mapper.Map<DirectionDTO>(direction);
	        directionDTO.CuratorName = direction.CuratorProfile.User.UserName;
	        return directionDTO;
        }
		public DepartmentDTO GetDepartmentDTO(Department department)
        {
	        var departmentDTO = _mapper.Map<DepartmentDTO>(department);
	        return departmentDTO;
        }
		public DeadlineDTO GetDeadlineDTO(Deadline deadline)
        {
	        var deadlineDTO = _mapper.Map<DeadlineDTO>(deadline);
	        deadlineDTO.DeadlineTypeName = deadline.DeadlineType.DisplayValue;
	        deadlineDTO.DirectionName = deadline.Direction.Name;
	        return deadlineDTO;
        }

		#endregion

		#region Users

		public UserDTO GetUserDTO(User user)
		{
			return _mapper.Map<UserDTO>(user);
		}

		public RoleDTO GetRoleDTO(Role role)
		{
			return _mapper.Map<RoleDTO>(role);
		}

		public async Task<UserFullInfoDTO> GetUserFullInfoDTO(User user)
		{
			var userFullInfoDTO = _mapper.Map<UserFullInfoDTO>(user);
			var roles = await _usersRepository.GetRolesAsync(user.Id).ConfigureAwait(false);
			userFullInfoDTO.Roles = roles.Select(GetRoleDTO).ToArray();
			userFullInfoDTO.DirectionId = user.StudentProfile?.DirectionId;
			var direction = userFullInfoDTO.DirectionId == null
				? null
				: await _directionRepository.GetAsync((long)userFullInfoDTO.DirectionId).ConfigureAwait(false);
			userFullInfoDTO.DirectionName = direction == null ? "" : direction.Name;
			userFullInfoDTO.Course = user.StudentProfile?.Course;
			userFullInfoDTO.Group = user.StudentProfile?.Group;
			userFullInfoDTO.DepartmentId = user.LecturerProfile?.DepartmentId;
			var department = userFullInfoDTO.DepartmentId == null
				? null
				: await _departmentRepository.GetAsync((long)userFullInfoDTO.DepartmentId).ConfigureAwait(false);
			userFullInfoDTO.DepartmentName = department == null ? "" : department.Name;
			userFullInfoDTO.Contact = user.LecturerProfile?.Contact;
			return userFullInfoDTO;
		}

		#endregion

		#endregion
	}
}
