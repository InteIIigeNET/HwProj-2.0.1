using AutoMapper;
using HwProj.HomeworkService.API.Models;

namespace HwProj.HomeworkService.API
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<Homework, CreateHomeworkViewModel>().ReverseMap();
            CreateMap<Homework, HomeworkViewModel>().ReverseMap();
            CreateMap<HomeworkApplication, HomeworkApplicationViewModel>().ReverseMap();
            CreateMap<HomeworkApplication, CreateHomeworkViewModel>().ReverseMap();
        }
    }
}
