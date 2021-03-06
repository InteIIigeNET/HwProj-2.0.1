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

        private readonly IViewModelService _viewModelService;
        private readonly IUsersRepository _usersRepository;
        private readonly IMapper _mapper;

        #endregion

        #region Constructors: Public

        public UserService(IViewModelService viewModelService,
            IUsersRepository usersRepository, IMapper mapper)
        {
	        _viewModelService = viewModelService;
            _usersRepository = usersRepository;
            _mapper = mapper;
        }

        #endregion

        #region Methods: Public

        public async Task<UserDTO[]> GetUsersByRoleAsync(Roles role)
        {
            var users = await _usersRepository.GetUsersByRoleAsync(role).ConfigureAwait(false);

            return users.Select(_viewModelService.GetUserDTO).ToArray();
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
            if (!userRoles.Contains(Roles.Curator) && userRoles.Contains(Roles.Lecturer))
            {
                await _usersRepository.AddRoleToUserAsync(user.Id, Roles.Curator);
            }
            else
            {
	            throw new ObjectNotFoundException($"User with email {email} and necessary roles");
            }
        }

        public async Task<RoleDTO[]> GetUserRoles(string userId)
        {
            var roles = await _usersRepository.GetRolesAsync(userId).ConfigureAwait(false);
            return roles.Select(_viewModelService.GetRoleDTO).ToArray();
        }

        public async Task<UserFullInfoDTO> GetUserFullInfo(string userId)
        {
            var user = await _usersRepository.GetUserAsync(userId).ConfigureAwait(false);
            return await _viewModelService.GetUserFullInfoDTO(user).ConfigureAwait(false);
        }

        public async Task AddReviewerRoleToUser(string userId)
        {
	        var roles = await _usersRepository.GetRolesTypesAsync(userId).ConfigureAwait(false);
	        if (!roles.Contains(Roles.Reviewer))
	        {
		        await _usersRepository.AddRoleToUserAsync(userId, Roles.Reviewer).ConfigureAwait(false);
	        }
        }

        public async Task RemoveReviewerRole(string userId)
        {
	        var roles = await _usersRepository.GetRolesTypesAsync(userId).ConfigureAwait(false);
	        if (roles.Contains(Roles.Reviewer))
	        {
		        await _usersRepository.RemoveRoleFromUserAsync(userId, Roles.Reviewer).ConfigureAwait(false);
	        }
        }

        #endregion
    }
}
