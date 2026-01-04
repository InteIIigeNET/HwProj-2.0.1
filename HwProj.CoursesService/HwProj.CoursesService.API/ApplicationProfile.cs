using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<Course, CreateCourseViewModel>().ReverseMap();
            CreateMap<Course, UpdateCourseViewModel>().ReverseMap();

            CreateMap<CourseMate, CourseMateViewModel>();

            CreateMap<CreateHomeworkViewModel, Homework>();
            CreateMap<HomeworkTask, HomeworkTaskViewModel>().ReverseMap();
            CreateMap<PostTaskViewModel, HomeworkTask>().ReverseMap();
            
            CreateMap<CreateCourseFilterDTO, CreateCourseFilterModel>();
            CreateMap<Filter, CourseFilterDTO>();
        }
    }
}