using AutoMapper;
using HwProj.Models.SolutionsService;
using Solution = HwProj.SolutionsService.API.Models.Solution;

namespace HwProj.SolutionsService.API
{
    public class AutomapperProfile : Profile
    {
        public AutomapperProfile()
        {
            CreateMap<Solution, SolutionViewModel>().ReverseMap();
            CreateMap<Solution, SolutionDto>();
            CreateMap<PostSolutionModel, Solution>();
        }
    }
}
