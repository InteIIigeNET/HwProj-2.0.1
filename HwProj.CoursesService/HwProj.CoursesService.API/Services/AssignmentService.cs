using System.Linq;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;

using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Services
{
    public class AssignmentService : IAssignmentsService
    {
        private readonly IAssignmentsRepository _assignmentsRepository;
        private readonly ICourseMatesRepository _courseMatesRepository;
        private readonly ICoursesRepository _coursesRepository;

        public AssignmentService(IAssignmentsRepository assignmentRepository,
                ICourseMatesRepository courseMatesRepository,
                ICoursesRepository coursesRepository)
        {
            _courseMatesRepository = courseMatesRepository;
            _assignmentsRepository = assignmentRepository;
            _coursesRepository = coursesRepository;
        }

        public async Task DeassignStudentAsync(string studentId, long courseId)
        {
            var student = await _assignmentsRepository.FindAsync(s => s.StudentId == studentId && s.CourseId == courseId);

            if (student != null)
            {
                await _assignmentsRepository.DeleteAsync(student.Id);
            }
        }

        public async Task<bool> AssignStudentAsync(string studentId, string mentorId, long courseId)
        {
            var course= await _coursesRepository.FindAsync(c => c.Id == courseId);
            var isMentorIdCorrect = course?.MentorIds.Split('/')?.Contains(mentorId) ?? false;

            if (course == null || !isMentorIdCorrect
                               || await _courseMatesRepository.FindAsync(c => c.IsAccepted && c.StudentId == studentId && c.CourseId == courseId) == null)
            {
                return false;
            }

            var student = await _assignmentsRepository.FindAsync(a => a.CourseId == courseId && a.StudentId == studentId);

            if (student != null)
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

            return true;
        }
    }
}
