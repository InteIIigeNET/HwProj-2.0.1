using AutoMapper;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using User = HwProj.AuthService.API.Models.User;

namespace HwProj.AuthService.API
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<RegisterDataDTO, User>();
            CreateMap<EditAccountViewModel, EditDataDTO>();
            CreateMap<RegisterViewModel, RegisterDataDTO>();
            CreateMap<RegisterExpertViewModel, User>();
            CreateMap<User, ExpertDataDTO>();
        }
    }
}
