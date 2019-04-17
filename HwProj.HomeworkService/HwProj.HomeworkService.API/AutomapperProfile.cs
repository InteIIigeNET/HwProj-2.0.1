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
                .ForMember(dest => dest.Tasks, opts => opts.MapFrom(src => src.Tasks.Select(t => t.Id)));
            CreateMap<HomeworkTask, HomeworkTaskViewModel>().ReverseMap();
            CreateMap<CreateTaskViewModel, HomeworkTask>().ReverseMap();
        }
    }
}