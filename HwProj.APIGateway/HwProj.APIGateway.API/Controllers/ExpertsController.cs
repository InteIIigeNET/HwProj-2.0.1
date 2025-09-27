using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ExpertsController : AggregationController
{
    private readonly ICoursesServiceClient _coursesClient;
    private readonly IMapper _mapper;

    public ExpertsController(ICoursesServiceClient coursesClient,
        IAuthServiceClient authServiceClient,
        IMapper mapper) : base(authServiceClient)
    {
        _coursesClient = coursesClient;
        _mapper = mapper;
    }

    [HttpPost("invite")]
    [Authorize(Roles = Roles.LecturerRole)]
    [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> Invite(InviteExpertViewModel inviteExpertView)
    {
        var expert = await AuthServiceClient.GetAccountDataByEmail(inviteExpertView.UserEmail);
        if (expert == null)
            return NotFound("Эксперт с такой почтой не найден");

        if (expert.Role != Roles.ExpertRole || inviteExpertView.UserId != expert.UserId)
            return BadRequest("Пользователь с такой почтой не является экспертом");

        if (inviteExpertView.UserId != expert.UserId)
            return BadRequest("Идентификатор эксперта с такой почтой не соответствует переданному идентификатору");

        var courseFilterDto = _mapper.Map<CreateCourseFilterDTO>(inviteExpertView);

        var courseFilterCreationResult =
            await _coursesClient.CreateOrUpdateCourseFilter(inviteExpertView.CourseId, courseFilterDto);
        if (!courseFilterCreationResult.Succeeded) return BadRequest(courseFilterCreationResult.Errors);

        var acceptanceResult = await _coursesClient.AcceptLecturer(inviteExpertView.CourseId,
            inviteExpertView.UserEmail, inviteExpertView.UserId);
        return Ok(acceptanceResult);
    }

    [HttpPost("register")]
    [Authorize(Roles = Roles.LecturerRole)]
    [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> Register(RegisterExpertViewModel model)
    {
        var result = await AuthServiceClient.RegisterExpert(model, UserId);
        return Ok(result);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> Login(TokenCredentials credentials)
    {
        var result = await AuthServiceClient.LoginExpert(credentials).ConfigureAwait(false);
        return Ok(result);
    }

    [HttpGet("getToken")]
    [Authorize(Roles = Roles.LecturerRole)]
    [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetToken(string expertEmail)
    {
        var tokenMeta = await AuthServiceClient.GetExpertToken(expertEmail);
        return Ok(tokenMeta);
    }

    [HttpPost("setProfileIsEdited")]
    [Authorize(Roles = Roles.ExpertRole)]
    [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> SetProfileIsEdited()
    {
        var result = await AuthServiceClient.SetExpertProfileIsEdited(UserId);
        return Ok(result);
    }

    [HttpGet("isProfileEdited")]
    [Authorize(Roles = Roles.ExpertRole)]
    [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetIsProfileEdited()
    {
        var result = await AuthServiceClient.GetIsExpertProfileEdited(UserId);
        return Ok(result);
    }

    [HttpGet("getAll")]
    [Authorize(Roles = Roles.LecturerRole)]
    [ProducesResponseType(typeof(ExpertDataDTO[]), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await AuthServiceClient.GetAllExperts();
        return Ok(result);
    }

    [HttpPost("updateTags")]
    [Authorize(Roles = Roles.LecturerRole)]
    [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> UpdateTags(UpdateExpertTagsDTO updateExpertTagsDto)
    {
        var result = await AuthServiceClient.UpdateExpertTags(UserId, updateExpertTagsDto);
        return Ok(result);
    }
}
