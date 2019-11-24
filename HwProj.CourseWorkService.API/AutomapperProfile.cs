using AutoMapper;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.ApplicationViewModels;
using HwProj.CourseWorkService.API.Models.CourseWorkViewModels;

namespace HwProj.CourseWorkService.API
{
    public class AutomapperProfile : Profile
    {
        public AutomapperProfile()
        {
            CreateMap<CourseWork, CourseWorkDetailsModel>();
            CreateMap<CourseWork, CourseWorkOverviewModel>();
            CreateMap<CourseWork, CreateCourseWorkViewModel>().ReverseMap();

            CreateMap<Application, SupervisorApplicationViewModel>();
            CreateMap<Application, StudentApplicationViewModel>();
            CreateMap<Application, CreateApplicationViewModel>().ReverseMap();
        }
    }
}
