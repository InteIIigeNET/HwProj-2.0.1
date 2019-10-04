using AutoMapper;
using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.Models.ViewModels;

namespace HwProj.AuthService.API
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<RegisterViewModel, User>();
        }
    }
}
