using AutoMapper;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.APIGateway.API
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<InviteExpertViewModel, CreateCourseFilterDTO>();
            CreateMap<WorkspaceViewModel, CreateCourseFilterDTO>();
        }
    }
}