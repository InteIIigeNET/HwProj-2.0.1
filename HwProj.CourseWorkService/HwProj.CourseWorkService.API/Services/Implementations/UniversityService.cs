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
    public class UniversityService : IUniversityService
    {
        #region Fields: Private

        private readonly IDirectionRepository _directionRepository;
        private readonly IMapper _mapper;

        #endregion

        #region Constructors: Public

        public UniversityService(IDirectionRepository directionRepository, IMapper mapper)
        {
            _directionRepository = directionRepository;
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

        #endregion
    }
}
