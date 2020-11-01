using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Interfaces;

namespace HwProj.CourseWorkService.API.Services.Implementations
{
    public class UserService : IUserService
    {
        #region Fields: Private

        private readonly IDirectionRepository _directionRepository;
        private readonly IUsersRepository _usersRepository;
        private readonly IMapper _mapper;

        #endregion

        #region Constructors: Public

        public UserService(IDirectionRepository directionRepository, IUsersRepository usersRepository, IMapper mapper)
        {
            _directionRepository = directionRepository;
            _usersRepository = usersRepository;
            _mapper = mapper;
        }

        #endregion

        #region Methods: Private

        private DirectionDTO GetDirectionDTO(Direction direction)
        {
            var directionDTO = _mapper.Map<DirectionDTO>(direction);
            directionDTO.CuratorName = direction.CuratorProfile.User.UserName;
            return directionDTO;
        }

        private Direction GetDirectionFromViewModel(AddDirectionViewModel directionViewModel)
        {
            var direction = _mapper.Map<Direction>(directionViewModel);
            direction.CuratorProfileId = directionViewModel.CuratorId;
            return direction;
        }

        #endregion

        #region Methods: Public

        public async Task<DirectionDTO[]> GetDirectionsAsync()
        {
            var directions = await _directionRepository.GetDirectionsAsync().ConfigureAwait(false);
            return directions.Select(GetDirectionDTO).ToArray();
        }
        public async Task AddDirectionAsync(AddDirectionViewModel directionViewModel)
        {
            var direction = GetDirectionFromViewModel(directionViewModel);
            await _directionRepository.AddAsync(direction).ConfigureAwait(false);
        }
        public async Task DeleteDirectionAsync(long directionId)
        {
            await _directionRepository.DeleteAsync(directionId).ConfigureAwait(false);
        }

        public async Task UpdateStudentProfile(string userId, StudentProfileViewModel studentProfileViewModel)
        {
            var user = await _usersRepository.GetUserAsync(userId).ConfigureAwait(false);
        }

        #endregion
    }
}
