using FluentValidation;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Validators
{
    public sealed class CreateTaskViewModelValidator : AbstractValidator<CreateTaskViewModel>
    {
        public CreateTaskViewModelValidator(ITasksService tasksService, IHomeworksService homeworksService)
        {
            Include((x) => new GeneralCreateTaskViewModelValidator(
                homeworksService.GetHomeworkAsync(x.HomeworkId), 
                x.Id == 0 ? null : tasksService.GetForEditingTaskAsync(x.Id)
                ));
        }
    }
}
