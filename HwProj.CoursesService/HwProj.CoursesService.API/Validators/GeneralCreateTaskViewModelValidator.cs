using FluentValidation;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Validators;

public class GeneralCreateTaskViewModelValidator : AbstractValidator<CreateTaskViewModel>
{
    public GeneralCreateTaskViewModelValidator(HomeworkViewModel homework)
    {
        RuleFor(task => task.PublicationDate)
            .Must(p => p >= homework.PublicationDate)
            .When(t => t.PublicationDate != null)
            .WithMessage("Publication date of task cannot to be sooner than homework publication date");

        RuleFor(task => task.DeadlineDate).Null().When(task => !task.HasDeadline ?? true)
            .WithMessage("DeadlineDate cannot have a value if the task has no deadline or it is null.");

        RuleFor(task => task.HasDeadline).Null()
            .When(task => (task.HasDeadline ?? false) && task.DeadlineDate == null)
            .WithMessage("Task HasDeadline cannot to be true if deadline undefined.");
    }
}