using System.Data;
using System.Linq;
using FluentValidation;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.IdentityModel.Tokens;

namespace HwProj.CoursesService.API.Validators
{
    public sealed class CreateTaskViewModelValidator : AbstractValidator<CreateTaskViewModel>
    {
        public CreateTaskViewModelValidator(Homework homework, HomeworkTask? previousTaskState = null)
        {
            RuleFor(task => task.PublicationDate)
                .Must(p => p >= homework.PublicationDate)
                .When(t => t.PublicationDate != null)
                .WithMessage("Publication date of task cannot to be sooner than homework publication date");

            RuleFor(task => task.PublicationDate)
                .Must((p) =>
                    p == null || previousTaskState?.PublicationDate > DateTimeUtils.GetMoscowNow() ||
                    p == previousTaskState?.PublicationDate)
                .When(_ => previousTaskState != null)
                .WithMessage(
                    "It is not possible to change the publication date of a task if it has already been published to students.");

            RuleFor(task => task.PublicationDate)
                .Must(p => p >= homework.PublicationDate)
                .When(t => t.PublicationDate != null)
                .WithMessage("Publication date of task cannot to be sooner than homework publication date");

            RuleFor(task => task.DeadlineDate).Null().When(task => !task.HasDeadline ?? true)
                .WithMessage("DeadlineDate cannot to have a value if the task has no deadline or it is null.");

            RuleFor(task => task.HasDeadline).Null()
                .When(task => (task.HasDeadline ?? false) && task.DeadlineDate == null)
                .WithMessage("Task HasDeadline cannot to be true if deadline undefined.");
        }
    }
}
