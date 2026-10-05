using AutoMapper;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.CoursesService.DTO;

namespace HwProj.APIGateway.API;

public class ApplicationProfile : Profile
{
    public ApplicationProfile()
    {
        CreateMap<InviteExpertViewModel, CreateCourseFilterDTO>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.UserId));
        CreateMap<EditMentorWorkspaceDTO, CreateCourseFilterDTO>();
    }
}
