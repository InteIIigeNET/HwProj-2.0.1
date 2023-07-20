using System.Linq;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Services
{
    public class AssignmentsService : IAssignmentsService
    {
        private readonly IAssignmentsRepository _assignmentsRepository;
        private readonly ICoursesRepository _coursesRepository;

        public AssignmentsService(IAssignmentsRepository assignmentRepository,
            ICoursesRepository coursesRepository)
        {
            _assignmentsRepository = assignmentRepository;
            _coursesRepository = coursesRepository;
        }

        public async Task AssignStudentAsync(string studentId, string mentorId, long courseId)
        {
            var course = await _coursesRepository.GetWithCourseMatesAsync(courseId);

            if (course?.MentorIds.Contains(mentorId) is null)
            {
                return;
            }

            var courseMate = course.CourseMates.Where(cm => cm.StudentId.Equals(studentId))?.FirstOrDefault();
            if (courseMate is null || !courseMate.IsAccepted)
            {
                return;
            }

            var student = await _assignmentsRepository.FindAsync(a => a.CourseId == courseId && a.StudentId == studentId);

            if (!(student is null))
            {
                await _assignmentsRepository.UpdateAsync(student.Id, a => new Assignment()
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
            var student = await _assignmentsRepository.FindAsync(s => s.StudentId == studentId && s.CourseId == courseId);

            if (!(student is null))
            {
                await _assignmentsRepository.DeleteAsync(student.Id);
            }
        }

        public async Task<Assignment[]> GetAllAssignmentsByCourseAsync(long courseId)
        {
            return await _assignmentsRepository.GetAllByCourseAsync(courseId);
        }
    }
}
