using System.Threading.Tasks;
using FluentValidation;
using HwProj.CoursesService.API.Models;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Validators
{
    public sealed class GeneralCreateTaskViewModelValidator : AbstractValidator<CreateTaskViewModel>
    {
        public GeneralCreateTaskViewModelValidator(Task<Homework> homeworkPromise, Task<HomeworkTask>? previousTaskStatePromise = null)
        {
            RuleFor(task => task.PublicationDate)
                .MustAsync(async (p, _) => p >= (await homeworkPromise).PublicationDate)
                .When(t => t.PublicationDate != null)
                .WithMessage("Publication date of task cannot to be sooner than homework publication date");

            RuleFor(task => task.PublicationDate)
                .MustAsync(async (p, _) =>
                {
                    var previousTaskState = await previousTaskStatePromise!;

                    return p == null || previousTaskState?.PublicationDate > DateTimeUtils.GetMoscowNow() ||
                           p == previousTaskState?.PublicationDate;
                })
                .When(_ => previousTaskStatePromise != null)
                .WithMessage(
                    "It is not possible to change the publication date of a task if it has already been published to students.");

            RuleFor(task => task.DeadlineDate).Null().When(task => !task.HasDeadline ?? true)
                .WithMessage("DeadlineDate cannot to have a value if the task has no deadline or it is null.");

            RuleFor(task => task.DeadlineDate)
                .MustAsync(async (t, d, _) => d >= (await homeworkPromise).PublicationDate)
                .When(t => t.DeadlineDate != null)
                .WithMessage("Deadline date cannot to be earlier than publication date.");

            RuleFor(task => task.HasDeadline).Null()
                .When(task => (task.HasDeadline ?? false) && task.DeadlineDate == null)
                .WithMessage("Task HasDeadline cannot to be true if deadline undefined.");
        }
    }
}
