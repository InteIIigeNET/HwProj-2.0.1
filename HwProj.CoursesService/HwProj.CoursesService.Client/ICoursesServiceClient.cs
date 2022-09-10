using System.Threading.Tasks;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;

namespace HwProj.CoursesService.Client
{
    public interface ICoursesServiceClient
    {
        Task<CoursePreview[]> GetAllCourses();
        Task<CourseDTO?> GetCourseById(long courseId, string userId);
        Task<Result> DeleteCourse(long courseId);
        Task<long> CreateCourse(CreateCourseViewModel model, string mentorId);
        Task<Result> UpdateCourse(UpdateCourseViewModel model, long courseId);
        Task SignInCourse(long courseId, string studentId);
        Task<Result> AcceptStudent(long courseId, string studentId);
        Task<Result> RejectStudent(long courseId, string studentId);
        Task<CoursePreview[]> GetAllUserCourses();
        Task<TaskDeadlineDto[]> GetTaskDeadlines();
        Task<Result<long>> AddHomeworkToCourse(CreateHomeworkViewModel model, long courseId);
        Task<HomeworkViewModel> GetHomework(long homeworkId);
        Task<Result> UpdateHomework(CreateHomeworkViewModel model, long homeworkId);
        Task<Result> DeleteHomework(long homeworkId);
        Task<HomeworkTaskViewModel> GetTask(long taskId);
        Task<Result<long>> AddTask(CreateTaskViewModel taskViewModel, long homeworkId);
        Task<Result> DeleteTask(long taskId);
        Task<Result> UpdateTask(CreateTaskViewModel taskViewModel, long taskId);
        Task<GroupViewModel[]> GetAllCourseGroups(long courseId);
        Task<long> CreateCourseGroup(CreateGroupViewModel model, long courseId);
        Task DeleteCourseGroup(long courseId, long groupId);
        Task UpdateCourseGroup(UpdateGroupViewModel model, long courseId, long groupId);
        Task<GroupViewModel> GetCourseGroupsById(long courseId, string userId);
        Task AddStudentInGroup(long courseId, long groupId, string userId);
        Task RemoveStudentFromGroup(long courseId, long groupId, string userId);
        Task<GroupViewModel> GetGroupById(long groupId);
        Task<long[]> GetGroupTasks(long groupId);
        Task<Result> AcceptLecturer(long courseId, string lecturerEmail);
        Task<Result<AccountDataDto[]>> GetLecturersAvailableForCourse(long courseId);
        Task<bool> Ping();
    }
}
