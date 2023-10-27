using System.Data;
using FluentValidation;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Validators
{
    public sealed class CreateTaskViewModelValidator : AbstractValidator<CreateTaskViewModel>
    {
        public CreateTaskViewModelValidator(IHomeworksRepository homeworksRepository)
        {
            /*RuleFor(task => task.PublicationDate).MustAsync(async (task, publicationDate, _) =>
                {
                    var homework = await homeworksRepository.FindAsync(h => h.Id == task.HomeworkId);
                    return homework.PublicationDate <= publicationDate;
                }).When(task => task.PublicationDate != null)
                .WithMessage("Publication date of task cannot to be sooner than homework's publication date.");*/

            RuleFor(task => task.DeadlineDate).Null().When(task => !task.HasDeadline ?? true)
                .WithMessage("DeadlineDate cannot have a value if the task has no deadline or it is null.");

            RuleFor(task => task.HasDeadline).Null()
                .When(task => (task.HasDeadline ?? false) && task.DeadlineDate == null)
                .WithMessage("Task HasDeadline cannot to be true if deadline undefined.");
        }
    }
}
