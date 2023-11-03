using AutoMapper;
using FluentValidation;
using HwProj.CoursesService.API.Services;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Validators
{
    public sealed class CreateHomeworkViewModelValidator : AbstractValidator<CreateHomeworkViewModel>
    {
        public CreateHomeworkViewModelValidator(IHomeworksService homeworksService, IMapper mapper)
        {
            Include((h) => new GeneralCreateHomeworkViewModelValidator(
                mapper,
                h.Id == 0 ? null : homeworksService.GetForEditingHomeworkAsync(h.Id)
            ));
        }
    }
}