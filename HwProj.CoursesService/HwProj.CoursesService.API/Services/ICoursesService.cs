using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CoursesService.API.Services
{
    public interface ICoursesService
    {
        Task<List<Course>> GetAllAsync();
        Task<Course> GetAsync(long id);
        Task<long> AddAsync(Course course);
        Task DeleteAsync(long id);
        Task UpdateAsync(long courseId, Expression<Func<Course, Course>> updateFactory);
        Task<bool> AddStudentAsync(long courseId, string studentId);
        Task<bool> AcceptCourseMateAsync(long courseId, string studentId);
        Task<bool> RejectCourseMateAsync(long courseId, string studentId);
        List<long> GetStudentCourses(string studentId);
        List<long> GetMentorCourses(string mentorId);
    }
}