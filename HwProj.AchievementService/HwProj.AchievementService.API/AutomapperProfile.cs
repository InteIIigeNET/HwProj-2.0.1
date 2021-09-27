using AutoMapper;
using HwProj.Models.AchievementService;

namespace HwProj.AchievementService.API
{
    public class AutomapperProfile : Profile
    {
        public AutomapperProfile()
        {
            CreateMap<Achievement, AchievementViewModel>().ReverseMap();
        }
    }
}