using AutoMapper;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.CoursesService;

namespace HwProj.APIGateway.API
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<InviteExpertViewModel, CreateCourseFilterModel>();
        }
    }
}