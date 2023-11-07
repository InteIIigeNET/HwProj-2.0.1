using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.ViewModels;
using System;
using System.Linq;
using HwProj.Models;

namespace HwProj.CoursesService.API
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<Course, CreateCourseViewModel>().ReverseMap();
            CreateMap<Course, UpdateCourseViewModel>().ReverseMap();

            CreateMap<CourseMate, CourseMateViewModel>();

            CreateMap<CreateHomeworkViewModel, Homework>();
            CreateMap<HomeworkTask, HomeworkTaskViewModel>().ReverseMap();
            CreateMap<CreateTaskViewModel, HomeworkTask>().ReverseMap();
        }
    }
}