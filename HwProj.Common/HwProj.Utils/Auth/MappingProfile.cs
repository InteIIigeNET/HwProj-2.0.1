using AutoMapper;
using HwProj.Models.AuthService.ViewModels;

namespace HwProj.Utils.Auth
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<RegisterExpertViewModel, User>()
                .ForMember(destination => destination.Name,
                    options => options.MapFrom(model => model.Name))
                .ForMember(destination => destination.Surname,
                    options => options.MapFrom(model => model.Surname))
                .ForMember(destination => destination.MiddleName,
                    options => options.MapFrom(model => model.MiddleName))
                .ForMember(destination => destination.Email,
                    options => options.MapFrom(model => model.Email))
                .ForMember(destination => destination.Bio,
                    options => options.MapFrom(model => model.Bio))
                .ForMember(destination => destination.CompanyName,
                options => options.MapFrom(model => model.CompanyName));
        }
    }
}