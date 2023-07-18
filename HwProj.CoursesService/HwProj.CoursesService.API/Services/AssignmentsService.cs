﻿using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Services
{
    public class AssignmentsesService : IAssignmentsService
    {
        private readonly IAssignmentsRepository _assignmentsRepository;

        public AssignmentsesService(IAssignmentsRepository assignmentRepository)
        {
            _assignmentsRepository = assignmentRepository;
        }

        public async Task AssignStudentAsync(string studentId, string mentorId, long courseId)
        {
            if (_coursesRepository.FindAsync(c => c.MentorIds.Contains(mentorId)).Result == null)
            {
                return;
            }

            if (_coursesRepository.GetWithCourseMatesAsync(courseId).Result?.CourseMates
                    .Where(cm => cm.StudentId.Equals(studentId))?.FirstOrDefault() == null)
            {
                return;
            }


            var student = _assignmentsRepository.FindAsync(a => a.CourseId == courseId && a.StudentId == studentId);

            if (student.Result != null)
            {
                await _assignmentsRepository.UpdateAsync(student.Result.Id, a => new Assignment()
                {
                    MentorId = mentorId,
                });
            }
            else
            {
                await _assignmentsRepository.AddAsync(new Assignment
                {
                    CourseId = courseId,
                    StudentId = studentId,
                    MentorId = mentorId
                });
            }
        }

        public async Task DeassignStudentAsync(string studentId, long courseId)
        {
            var student = _assignmentRepository.FindAsync(s => s.StudentId == studentId && s.CourseId == courseId).Result;

            if (student != null)
            {
                await _assignmentRepository.DeleteAsync(student.Id);
            }
        }

        public async Task<Assignment[]> GetAllAssignmentsByCourseAsync(long courseId)
        {
            return await _assignmentRepository.GetAllByCourseAsync(courseId);
        }
    }
}