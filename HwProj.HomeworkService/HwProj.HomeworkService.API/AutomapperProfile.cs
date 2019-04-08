using System.Linq;
using AutoMapper;
using HwProj.HomeworkService.API.Models;

namespace HwProj.HomeworkService.API
{
    public class AutomapperProfile : Profile
    {
        public AutomapperProfile()
        {
            CreateMap<CreateHomeworkViewModel, Homework>();
            CreateMap<Homework, HomeworkViewModel>()
                .ForMember(dest => dest.Tasks, opts => opts.MapFrom(src => src.Tasks.Select(t => t.Id)))
                .ForMember(dest => dest.Date, opts => opts.MapFrom(src => src.Date.ToString("dd-MM-yy")));
            CreateMap<HomeworkTask, HomeworkTaskViewModel>().ReverseMap();
            CreateMap<CreateTaskViewModel, HomeworkTask>().ReverseMap();
        }
    }
}