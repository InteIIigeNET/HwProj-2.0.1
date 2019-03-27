using AutoMapper;
using HwProj.HomeworkService.API.Models;

namespace HwProj.HomeworkService.API
{
    public class AutomapperProfile : Profile
    {
        public AutomapperProfile()
        {
            CreateMap<Homework, CreateHomeworkViewModel>().ReverseMap();
            CreateMap<Homework, HomeworkViewModel>().ReverseMap();
            CreateMap<HomeworkTask, HomeworkTaskViewModel>().ReverseMap();
        }
    }
}