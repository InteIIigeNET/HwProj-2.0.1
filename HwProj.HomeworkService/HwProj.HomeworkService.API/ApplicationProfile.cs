using AutoMapper;
using HwProj.HomeworkService.API.Models;
using HwProj.HomeworkService.API.Models.ViewModels;

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
