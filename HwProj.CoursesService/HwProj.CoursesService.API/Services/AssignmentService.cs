using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Services
{
    public class AssignmentService : IAssignmentService
    {
        private readonly IAssignmentsRepository _assignmentRepository;

        public AssignmentService(IAssignmentsRepository assignmentRepository)
        {
            _assignmentRepository = assignmentRepository;
        }

        public async Task AssignStudentAsync(string studentId, string mentorId, long courseId)
        {
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

    public async Task AssignStudentAsync(string studentId, string mentorId, long courseId)
    {
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

    public Task DeassignStudentAsync(string studentId, long courseId);
}
