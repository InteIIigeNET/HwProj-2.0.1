using AutoMapper;
using HwProj.TasksService.API.Models;
using HwProj.TasksService.API.Models.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HwProj.TasksService.API
{
    public class ApplicationProfile : Profile
    {
        public ApplicationProfile()
        {
            CreateMap<HomeworkTask, TaskViewModel>().ReverseMap();
            CreateMap<HomeworkTask, CreateTaskViewModel>().ReverseMap();
        }
    }
}
