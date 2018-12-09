using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.ViewModels;

namespace HwProj.CoursesService.API
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<Course, CourseViewModel>().ReverseMap();
            CreateMap<Course, CreateCourseViewModel>().ReverseMap();
            CreateMap<Course, UpdateCourseViewModel>().ReverseMap();
        }
    }
}
