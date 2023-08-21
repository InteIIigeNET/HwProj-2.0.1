using AutoMapper;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.ViewModels;
using System;
using HwProj.Models;

namespace HwProj.CoursesService.API
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<Course, CourseDTO>().ForMember(
                t => t.MentorIds,
                cm => cm.MapFrom(course => course.MentorIds.Split("/", StringSplitOptions.None)));
            CreateMap<Course, CoursePreview>().ForMember(
                t => t.MentorIds,
                cm => cm.MapFrom(course => course.MentorIds.Split("/", StringSplitOptions.None)));

            CreateMap<Course, CreateCourseViewModel>().ReverseMap();
            CreateMap<Course, UpdateCourseViewModel>().ReverseMap();

            CreateMap<CourseMate, CourseMateViewModel>();

            CreateMap<CreateHomeworkViewModel, Homework>();
            CreateMap<Homework, HomeworkViewModel>();
            CreateMap<HomeworkTask, HomeworkTaskViewModel>().ReverseMap();
            CreateMap<HomeworkTask, HomeworkTaskViewModel>()
                .ForMember("IsDeferred", cm => cm.MapFrom(g => DateTimeUtils.GetMoscowNow() < g.PublicationDate));
            CreateMap<CreateTaskViewModel, HomeworkTask>().ReverseMap();
        }
    }
}
