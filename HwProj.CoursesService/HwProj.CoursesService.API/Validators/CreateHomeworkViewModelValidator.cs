using System;
using AutoMapper;
using FluentValidation;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;
using Newtonsoft.Json.Schema;

namespace HwProj.CoursesService.API.Validators
{
    public sealed class CreateHomeworkViewModelValidator : AbstractValidator<CreateHomeworkViewModel>
    {
        public CreateHomeworkViewModelValidator(IMapper mapper, Homework? previousHomeworkState = null)
        {
            RuleForEach(homework => homework.Tasks)
                .SetValidator(h => new CreateTaskViewModelValidator(mapper.Map<Homework>(h)));

            RuleFor(homework => homework.PublicationDate)
                .Must(p => previousHomeworkState?.Tasks.TrueForAll(t =>
                    t.PublicationDate == null || t.PublicationDate >= p) ?? false)
                .When(_ => previousHomeworkState != null)
                .WithMessage("Homework's publication date cannot to be earlier than task publication date");

            RuleFor(homework => homework.PublicationDate)
                .Must(p => previousHomeworkState?.PublicationDate > DateTimeUtils.GetMoscowNow()
                           || p == previousHomeworkState?.PublicationDate)
                .When(_ => previousHomeworkState != null)
                .WithMessage("It is not possible to change the publication date of a homework if it has already been published to students.");

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
    }
}
