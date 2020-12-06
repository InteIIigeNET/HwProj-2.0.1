using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CourseWorkService.API.Exceptions;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Interfaces;

namespace HwProj.CourseWorkService.API.Services.Implementations
{
    public class UserService : IUserService
    {
        #region Fields: Private

        private readonly IDepartmentRepository _departmentRepository;
        private readonly IDirectionRepository _directionRepository;
        private readonly IUsersRepository _usersRepository;
        private readonly IMapper _mapper;

        #endregion

        #region Constructors: Public

        public UserService(IDepartmentRepository departmentRepository, IDirectionRepository directionRepository,
            IUsersRepository usersRepository, IMapper mapper)
        {
            _departmentRepository = departmentRepository;
            _directionRepository = directionRepository;
            _usersRepository = usersRepository;
            _mapper = mapper;
        }

        #endregion

        #region Methods: Private

        private UserDTO GetUserDTO(User user)
        {
            return _mapper.Map<UserDTO>(user);
        }

        private RoleDTO GetRoleDTO(Role role)
        {
            return _mapper.Map<RoleDTO>(role);
        }

        private async Task<UserFullInfoDTO> GetUserFullInfoDTO(User user)
        {
            var userFullInfoDTO = _mapper.Map<UserFullInfoDTO>(user);
            userFullInfoDTO.Roles = await GetUserRoles(user.Id).ConfigureAwait(false);
            userFullInfoDTO.DirectionId = user.StudentProfile?.DirectionId;
            var direction = userFullInfoDTO.DirectionId == null
                ? null
                : await _directionRepository.GetAsync((long) userFullInfoDTO.DirectionId).ConfigureAwait(false);
            userFullInfoDTO.DirectionName = direction == null ? "" : direction.Name;
            userFullInfoDTO.Course = user.StudentProfile?.Course;
            userFullInfoDTO.Group = user.StudentProfile?.Group;
            userFullInfoDTO.DepartmentId = user.LecturerProfile?.DepartmentId;
            var department = userFullInfoDTO.DepartmentId == null
                ? null
                : await _departmentRepository.GetAsync((long) userFullInfoDTO.DepartmentId).ConfigureAwait(false);
            userFullInfoDTO.DepartmentName = department == null ? "" : department.Name;
            userFullInfoDTO.Contact = user.LecturerProfile?.Contact;
            return userFullInfoDTO;
        }
        #endregion

        #region Methods: Public

        public async Task<UserDTO[]> GetUsersByRoleAsync(RoleTypes role)
        {
            var users = await _usersRepository.GetUsersByRoleAsync(role).ConfigureAwait(false);

            return users.Select(GetUserDTO).ToArray();
        }

        public async Task UpdateUserRoleProfile<TProfile, TProfileViewModel>(string userId, TProfileViewModel viewModel)
            where TProfile : class, IProfile
        {
            var profile = _mapper.Map<TProfile>(viewModel);
            profile.Id = userId;
            await _usersRepository.UpdateUserRoleProfileAsync(userId, profile).ConfigureAwait(false);
        }

        public async Task InviteCuratorAsync(string email)
        {
            var user = await _usersRepository.FindAsync(u => u.Email == email).ConfigureAwait(false);
            if (user == null)
            {
                throw new ObjectNotFoundException($"User with email {email}");
            }

            var userRoles = await _usersRepository.GetRolesTypesAsync(user.Id).ConfigureAwait(false);
            if (!userRoles.Contains(RoleTypes.Curator) && userRoles.Contains(RoleTypes.Lecturer))
            {
                await _usersRepository.AddRoleToUserAsync(user.Id, RoleTypes.Curator);
            }
        }

        public async Task<RoleDTO[]> GetUserRoles(string userId)
        {
            var roles = await _usersRepository.GetRolesAsync(userId).ConfigureAwait(false);
            return roles.Select(GetRoleDTO).ToArray();
        }

        public async Task<UserFullInfoDTO> GetUserFullInfo(string userId)
        {
            var user = await _usersRepository.GetUserAsync(userId).ConfigureAwait(false);
            return await GetUserFullInfoDTO(user).ConfigureAwait(false);
        }

        #endregion
    }
}
