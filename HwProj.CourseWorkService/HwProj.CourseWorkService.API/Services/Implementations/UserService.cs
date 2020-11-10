using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Interfaces;

namespace HwProj.CourseWorkService.API.Services.Implementations
{
    public class UserService : IUserService
    {
        #region Fields: Private

        private readonly IUsersRepository _usersRepository;
        private readonly IMapper _mapper;

        #endregion

        #region Constructors: Public

        public UserService(IUsersRepository usersRepository, IMapper mapper)
        {
            _usersRepository = usersRepository;
            _mapper = mapper;
        }

        #endregion

        #region Methods: Private

        private UserDTO GetUserDTO(User user)
        {
            return _mapper.Map<UserDTO>(user);
        }

        #endregion

        #region Methods: Public

        public async Task<UserDTO[]> GetUsersByRoleAsync(RoleTypes role)
        {
            var users = await _usersRepository.GetUsersByRoleAsync(role).ConfigureAwait(false);

            return users.Select(GetUserDTO).ToArray();
        }

        public async Task UpdateStudentProfile(string userId, StudentProfileViewModel studentProfileViewModel)
        {
            var profile = _mapper.Map<StudentProfile>(studentProfileViewModel);
            profile.Id = userId;
            await _usersRepository.UpdateUserRoleProfileAsync(userId, profile);
        }

        #endregion
    }
}
