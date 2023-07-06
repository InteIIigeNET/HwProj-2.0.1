using AutoMapper;
using HwProj.Models.SolutionsService;

namespace HwProj.SolutionsService.API
{
    public class AutomapperProfile : Profile
    {
        public AutomapperProfile()
        {
            CreateMap<Solution, SolutionViewModel>().ReverseMap();
            CreateMap<PostSolutionModel, Solution>();
        }
    }
}
