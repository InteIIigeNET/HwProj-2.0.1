﻿using System.Threading.Tasks;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;

namespace HwProj.CoursesService.Client
{
    public interface ICoursesServiceClient
    {
        Task<CoursePreview[]> GetAllCourses();
        Task<CourseDTO?> GetCourseById(long courseId);
        Task<Result<CourseDTO>> GetCourseByIdForMentor(long courseId, string mentorId);
        Task<Result<CourseDTO>> GetAllCourseData(long courseId);
        Task<CourseDTO?> GetCourseByTask(long taskId);
        Task<Result> DeleteCourse(long courseId);
        Task<Result<long>> CreateCourse(CreateCourseViewModel model);
        Task<Result> UpdateCourse(UpdateCourseViewModel model, long courseId);
        Task SignInCourse(long courseId, string studentId);
        Task<Result> AcceptStudent(long courseId, string studentId);
        Task<Result> RejectStudent(long courseId, string studentId);

        Task<Result> UpdateStudentCharacteristics(long courseId, string studentId,
            StudentCharacteristicsDto characteristics);

        Task<CourseDTO[]> GetAllUserCourses();
        Task<TaskDeadlineDto[]> GetTaskDeadlines();
        Task<Result<HomeworkViewModel>> AddHomeworkToCourse(CreateHomeworkViewModel model, long courseId);
        Task<Result<HomeworkViewModel>> GetHomework(long homeworkId);
        Task<HomeworkViewModel> GetForEditingHomework(long homeworkId);
        Task<Result<HomeworkViewModel>> UpdateHomework(long homeworkId, CreateHomeworkViewModel model);
        Task<Result> DeleteHomework(long homeworkId);
        Task<Result<HomeworkTaskViewModel>> GetTask(long taskId);
        Task<HomeworkTaskForEditingViewModel> GetForEditingTask(long taskId);
        Task<Result<HomeworkTaskViewModel>> AddTask(long homeworkId, CreateTaskViewModel taskViewModel);
        Task<Result> DeleteTask(long taskId);
        Task<Result<HomeworkTaskViewModel>> UpdateTask(long taskId, CreateTaskViewModel taskViewModel);
        Task<GroupViewModel[]> GetAllCourseGroups(long courseId);
        Task<long> CreateCourseGroup(CreateGroupViewModel model, long courseId);
        Task DeleteCourseGroup(long courseId, long groupId);
        Task UpdateCourseGroup(UpdateGroupViewModel model, long courseId, long groupId);
        Task<GroupViewModel> GetCourseGroupsById(long courseId, string userId);
        Task AddStudentInGroup(long courseId, long groupId, string userId);
        Task RemoveStudentFromGroup(long courseId, long groupId, string userId);
        Task<GroupViewModel[]> GetGroupsById(params long[] groupIds);
        Task<long[]> GetGroupTasks(long groupId);
        Task<Result> AcceptLecturer(long courseId, string lecturerEmail, string lecturerId);
        Task<Result<AccountDataDto[]>> GetLecturersAvailableForCourse(long courseId);
        Task<string[]> GetCourseLecturersIds(long courseId);
        Task<Result<string[]>> GetAllTagsForCourse(long courseId);
        Task<Result<long>> CreateOrUpdateCourseFilter(long courseId, CreateCourseFilterDTO model);
        Task AddQuestionForTask(AddTaskQuestionDto question);
        Task<GetTaskQuestionDto[]> GetQuestionsForTask(long taskId);
        Task AddAnswerForQuestion(AddAnswerForQuestionDto answer);
        Task<MentorToAssignedStudentsDTO[]> GetMentorsToAssignedStudents(long courseId);
        Task<bool> Ping();
    }
}
