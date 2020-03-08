using AutoMapper;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;

namespace HwProj.CourseWorkService.API
{
    public class AutomapperProfile : Profile
    {
        public AutomapperProfile()
        {
            CreateMap< CourseWork, OverviewCourseWork>();
            CreateMap<CourseWork, DetailCourseWork>();
            CreateMap<CourseWork, CreateCourseWork>().ReverseMap();

            CreateMap<Application, StudentOverviewApplication>();
            CreateMap<Application, LecturerOverviewApplication>();
            CreateMap<Application, CreateApplication>().ReverseMap();

            CreateMap<WorkFile, AddFileOrReference>().ReverseMap();
            CreateMap<Deadline, AddDeadline>().ReverseMap();
        }
    }
}
