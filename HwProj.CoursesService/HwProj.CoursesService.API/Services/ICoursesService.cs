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
        Task<bool> AddStudent(long courseId, long studentId);
        Task<bool> AcceptCourseMate(long courseId, long studentId);
        Task<bool> RejectCourseMate(long courseId, long studentId);
        List<long> GetStudentCourses(long studentId);
        List<long> GetMentorCourses(long mentorId);
    }
}