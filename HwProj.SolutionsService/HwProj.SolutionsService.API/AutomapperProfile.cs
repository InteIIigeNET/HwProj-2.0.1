using AutoMapper;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API
{
    public class AutomapperProfile : Profile
    {
        public AutomapperProfile()
        {
            CreateMap<Solution, CreateSolutionViewModel>().ReverseMap();
        }
    }
}