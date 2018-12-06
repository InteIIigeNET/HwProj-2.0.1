using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<Course, CourseViewModel>().ReverseMap();
            CreateMap<Course, CreateCourseViewModel>().ReverseMap();
            CreateMap<Course, UpdateCourseViewModel>().ReverseMap();
        }
    }
}
