using AutoMapper;
using HwProj.AuthService.API.Models;
using HwProj.Models.AuthService.ViewModels;

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
