using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.DTO;
using HwProj.CoursesService.API.Models.ViewModels;
using System.Linq;

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
            CreateMap<UserGroupDescription, Group>().ReverseMap()
                .ForMember("Tasks", cm => cm.MapFrom(g => g.Tasks.Select(c => c.TaskId).ToList()))
                .ForMember("GroupMates", cm => cm.MapFrom(g => g.GroupMates.Select(c => new GroupMateViewModel { StudentId = c.StudentId }).ToList()));
            CreateMap<Group, CreateGroupViewModel>().ReverseMap()
                .ForMember("Tasks", cm => cm.MapFrom(g => g.Tasks.Select(c => new TaskModel { TaskId = c }).ToList()))
                .ForMember("GroupMates", cm => cm.MapFrom(g => g.GroupMates.Select(c => new GroupMate { StudentId = c.StudentId }).ToList()));
            CreateMap<UpdateGroupViewModel, Group>()
                .ForMember("Tasks", cm => cm.MapFrom(g => g.Tasks.Select(c => new TaskModel { TaskId = c }).ToList()))
                .ForMember("GroupMates", cm => cm.MapFrom(g => g.GroupMates.Select(c => new GroupMate { StudentId = c.StudentId }).ToList()));

            CreateMap<GroupMate, GroupMateViewModel>();

            CreateMap<CourseMate, CourseMateViewModel>();
        }
    }
}
