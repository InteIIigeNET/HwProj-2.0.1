using AutoMapper;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API
{
    public class AutomapperProfile : Profile
    {
        public AutomapperProfile()
        {
            CreateMap<Solution, SolutionViewModel>().ReverseMap();
        }
    }
}
