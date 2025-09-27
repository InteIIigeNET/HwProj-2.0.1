using AutoMapper;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.CoursesService.DTO;

namespace HwProj.APIGateway.API
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<InviteExpertViewModel, CreateCourseFilterDTO>();
            CreateMap<EditMentorWorkspaceDTO, CreateCourseFilterDTO>();
        }
    }
}