using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.DTO;
using HwProj.CoursesService.API.Models.ViewModels;

namespace HwProj.CoursesService.API
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<Course, UserCourseDescription>();
            CreateMap<Course, CourseViewModel>().ReverseMap();
            CreateMap<Course, CreateCourseViewModel>().ReverseMap();
            CreateMap<Course, UpdateCourseViewModel>().ReverseMap();

            CreateMap<Group, UserGroupDescription>();
            CreateMap<Group, GroupViewModel>().ReverseMap();
            CreateMap<Group, CreateGroupViewModel>().ReverseMap();

            CreateMap<GroupMate, CourseMateViewModel>();

            CreateMap<CourseMate, CourseMateViewModel>();
        }
    }
}
