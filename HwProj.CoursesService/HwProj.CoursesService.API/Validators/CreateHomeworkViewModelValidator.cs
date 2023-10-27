using System;
using FluentValidation;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Validators
{
    public sealed class CreateHomeworkViewModelValidator : AbstractValidator<CreateHomeworkViewModel>
    {
        public CreateHomeworkViewModelValidator()
        {
            RuleForEach(homework => homework.Tasks)
                .SetValidator(h => new TaskInHomeworkViewModelValidator(h.PublicationDate));

            RuleFor(homework => homework.DeadlineDate)
                .Null()
                .When(h => !h.HasDeadline)
                .WithMessage("Deadline cannot to have value if homework doesn't have deadline.");

            RuleFor(homework => homework.HasDeadline)
                .Equal(false)
                .When(h => h.DeadlineDate == null)
                .WithMessage("DeadlineDate doesn't have a value, but homework has a deadline.");

            RuleFor(homework => homework.IsDeadlineStrict)
                .Equal(false)
                .When(h => !h.HasDeadline || h.DeadlineDate == null)
                .WithMessage("The deadline cannot be a string if there is no deadline in the homework.");
        }

        private class TaskInHomeworkViewModelValidator : AbstractValidator<CreateTaskViewModel>
        {
            public TaskInHomeworkViewModelValidator(DateTime homeworkPublicationDate)
            {
                RuleFor(task => task.PublicationDate)
                    .Must(p => p >= homeworkPublicationDate)
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
}
