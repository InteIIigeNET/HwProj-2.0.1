using AutoMapper;
using HwProj.HomeworkService.API.Models;

namespace HwProj.HomeworkService.API
{
    public class AutomapperProfile : Profile
    {
        public AutomapperProfile()
        {
            CreateMap<CreateHomeworkViewModel, Homework>();
            CreateMap<Homework, HomeworkViewModel>();
            CreateMap<HomeworkTask, HomeworkTaskViewModel>().ReverseMap();
            CreateMap<CreateTaskViewModel, HomeworkTask>().ReverseMap();
        }
    }
}