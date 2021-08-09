using System.Threading.Tasks;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.Client
{
    public interface ICoursesServiceClient
    {
        Task<CourseViewModel[]> GetAllCourses();
        Task<CourseViewModel> GetCourseById(long courseId);
        Task DeleteCourse(long courseId);
        Task<long> CreateCourse(CreateCourseViewModel model, string mentorId);
        Task UpdateCourse(UpdateCourseViewModel model, long courseId);
        Task SignInCourse(long courseId, string studentId);
        Task AcceptStudent(long courseId, string studentId);
        Task RejectStudent(long courseId, string studentId);
        Task<UserCourseDescription[]> GetAllUserCourses(string userId);
        Task<long> AddHomeworkToCourse(CreateHomeworkViewModel model, long courseId);
        Task<HomeworkViewModel> GetHomework(long homeworkId);
        Task UpdateHomework(CreateHomeworkViewModel model, long homeworkId);
        Task DeleteHomework(long homeworkId);
        Task<HomeworkTaskViewModel> GetTask(long taskId);
        Task<long> AddTask(CreateTaskViewModel taskViewModel, long homeworkId);
        Task DeleteTask(long taskId);
        Task UpdateTask(CreateTaskViewModel taskViewModel, long taskId);
        Task<GroupViewModel[]> GetAllCourseGroups(long courseId);
        Task<long> CreateCourseGroup(CreateGroupViewModel model, long courseId);
        Task DeleteCourseGroup(long courseId, long groupId);
        Task UpdateCourseGroup(UpdateGroupViewModel model, long courseId, long groupId);
        Task<GroupViewModel> GetCourseGroupsById(long courseId, string userId);
        Task AddStudentInGroup(long courseId, long groupId, string userId);
        Task RemoveStudentFromGroup(long courseId, long groupId, string userId);
        Task<GroupViewModel> GetGroupById(long groupId);
        Task<long[]> GetGroupTasks(long groupId);
    }
}
