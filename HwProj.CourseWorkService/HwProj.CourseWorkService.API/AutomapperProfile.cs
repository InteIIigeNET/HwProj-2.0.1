using AutoMapper;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Models.ViewModels;

namespace HwProj.CourseWorkService.API
{
    public class AutomapperProfile : Profile
    {
        public AutomapperProfile()
        {
            CreateMap< CourseWork, OverviewCourseWorkDTO>();
            CreateMap<OverviewCourseWorkDTO, ReviewerOverviewCourseWorkDTO>();
            CreateMap<CourseWork, DetailCourseWorkDTO>();
            CreateMap<CourseWork, CreateCourseWorkViewModel>().ReverseMap();
            CreateMap<Application, StudentApplicationDTO>();
            CreateMap<Application, LecturerApplicationDTO>();
            CreateMap<Application, OverviewApplicationDTO>();
            CreateMap<Application, CreateApplicationViewModel>().ReverseMap();
            CreateMap<Deadline, DeadlineDTO>();
            CreateMap<Deadline, AddDeadlineViewModel>().ReverseMap();
            CreateMap<WorkFile, WorkFileDTO>();
            CreateMap<Direction, DirectionDTO>();
            CreateMap<Direction, AddDirectionViewModel>().ReverseMap();
            CreateMap<Department, DepartmentDTO>();
            CreateMap<Department, AddDepartmentViewModel>().ReverseMap();
            CreateMap<StudentProfile, StudentProfileViewModel>().ReverseMap();
            CreateMap<LecturerProfile, LecturerProfileViewModel>().ReverseMap();
            CreateMap<CuratorProfile, CuratorProfileViewModel>().ReverseMap();
            CreateMap<User, UserDTO>();
            CreateMap<User, UserFullInfoDTO>();
            CreateMap<Role, RoleDTO>();
        }
    }
}
