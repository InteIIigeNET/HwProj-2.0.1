using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services.Implementations
{
    public class UniversityService : IUniversityService
    {
        #region Fields: Private

        private readonly IDepartmentRepository _departmentRepository;
        private readonly IDirectionRepository _directionRepository;
        private readonly IMapper _mapper;

        #endregion

        #region Constructors: Public

        public UniversityService(IDepartmentRepository departmentRepository, IDirectionRepository directionRepository,
            IMapper mapper)
        {
            _departmentRepository = departmentRepository;
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

        private DepartmentDTO GetDepartmentDTO(Department department)
        {
            var departmentDTO = _mapper.Map<DepartmentDTO>(department);
            return departmentDTO;
        }

        private Direction GetDirectionFromViewModel(AddDirectionViewModel directionViewModel)
        {
            var direction = _mapper.Map<Direction>(directionViewModel);
            direction.CuratorProfileId = directionViewModel.CuratorId;
            return direction;
        }

        private Department GetDepartmentFromViewModel(AddDepartmentViewModel departmentViewModel)
        {
            var department = _mapper.Map<Department>(departmentViewModel);
            return department;
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

        public async Task<DepartmentDTO[]> GetDepartmentsAsync()
        {
            var departments = await _departmentRepository.GetAll().ToArrayAsync().ConfigureAwait(false);
            return departments.Select(GetDepartmentDTO).ToArray();
        }
        public async Task AddDepartmentAsync(AddDepartmentViewModel departmentViewModel)
        {
            var department = GetDepartmentFromViewModel(departmentViewModel);
            await _departmentRepository.AddAsync(department).ConfigureAwait(false);
        }
        public async Task DeleteDepartmentAsync(long departmentId)
        {
            await _departmentRepository.DeleteAsync(departmentId).ConfigureAwait(false);
        }

        #endregion
    }
}
