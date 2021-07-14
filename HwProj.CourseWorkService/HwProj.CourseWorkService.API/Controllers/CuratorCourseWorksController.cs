using System.Net;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Exceptions;
using HwProj.CourseWorkService.API.Filters;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Services.Interfaces;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Authorize]
    [Route("api/curator")]
    [TypeFilter(typeof(OnlySelectRoleAttribute), Arguments = new object[] { Roles.Curator })]
    [TypeFilter(typeof(CommonExceptionFilterAttribute),
        Arguments = new object[] { new[] { typeof(ObjectNotFoundException) } })]
    [ApiController]
    public class CuratorCourseWorksController : ControllerBase
    {
        #region Fields: Private

        private readonly ICourseWorksService _courseWorksService;
        private readonly IReviewService _reviewService;
        private readonly IUniversityService _universityService;
        private readonly IUserService _userService;

        #endregion

        #region Constructors: Public

        public CuratorCourseWorksController(ICourseWorksService courseWorksService, IReviewService reviewService,
            IUniversityService universityService, IUserService userService)
        {
            _courseWorksService = courseWorksService;
            _reviewService = reviewService;
            _universityService = universityService;
            _userService = userService;
        }

        #endregion

        #region Methods: Public

        [HttpPost("course_works/add")]
        [ProducesResponseType(typeof(int), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> AddCourseWorkAsync([FromBody] CreateCourseWorkViewModel createCourseWorkViewModel)
        {
            var userId = Request.GetUserId();
            var id = await _courseWorksService.AddCourseWorkAsync(createCourseWorkViewModel, userId, true);
            return Ok(id);
        }

        [HttpGet("course_works/created_by_curator/{status}")]
        [ProducesResponseType(typeof(OverviewCourseWorkDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetMyCourseWork(string status)
        {
	        if (status != "active" && status != "completed")
	        {
		        return NotFound();
	        }

	        var userId = Request.GetUserId();
	        var courseWorks = await _courseWorksService
		        .GetFilteredCourseWorksAsync(courseWork =>
			        courseWork.IsCompleted == (status == "completed") &&
			        courseWork.LecturerProfileId == userId &&
			        courseWork.CreatedByCurator)
		        .ConfigureAwait(false);
	        return Ok(courseWorks);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfileAsync([FromBody] CuratorProfileViewModel curatorProfileViewModel)
        {
            var userId = Request.GetUserId();
            await _userService.UpdateUserRoleProfile<CuratorProfile, CuratorProfileViewModel>(userId, curatorProfileViewModel)
                .ConfigureAwait(false);
            return Ok();
        }

        [HttpPost("invite")]
        public async Task<IActionResult> InviteCuratorAsync([FromBody] InviteCuratorViewModel model)
        {
            await _userService.InviteCuratorAsync(model.Email);
            return Ok();
        }

        [HttpPost("directions")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddDirectionAsync([FromBody] AddDirectionViewModel directionViewModel)
        {
            var id = await _universityService.AddDirectionAsync(directionViewModel).ConfigureAwait(false);
            return Ok(id);
        }

        [HttpDelete("directions/{directionId}")]
        public async Task<IActionResult> DeleteDirectionAsync(long directionId)
        {
            await _universityService.DeleteDirectionAsync(directionId).ConfigureAwait(false);
            return Ok();
        }

        [HttpPost("departments")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddDepartmentAsync([FromBody] AddDepartmentViewModel departmentViewModel)
        {
            var id = await _universityService.AddDepartmentAsync(departmentViewModel).ConfigureAwait(false);
            return Ok(id);
        }

        [HttpDelete("departments/{departmentId}")]
        public async Task<IActionResult> DeleteDepartmentAsync(long departmentId)
        {
            await _universityService.DeleteDepartmentAsync(departmentId).ConfigureAwait(false);
            return Ok();
        }

        [HttpGet("deadlines")]
		[ProducesResponseType(typeof(DeadlineDTO[]), (int)HttpStatusCode.OK)]
		public async Task<IActionResult> GetDeadlinesAsync()
		{
			var userId = Request.GetUserId();
			var deadlinesDTO = await _universityService.GetCuratorDeadlines(userId).ConfigureAwait(false);
			return Ok(deadlinesDTO);
		}

		[HttpPost("deadlines")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddDeadlineAsync([FromBody] AddDeadlineViewModel addDeadlineViewModel)
		{
			if (addDeadlineViewModel.DeadlineTypeId == (long) DeadlineTypes.ChoiceTheme
			    && (addDeadlineViewModel.DirectionId == null 
			        || addDeadlineViewModel.Course == null 
			        || addDeadlineViewModel.CourseWorkId != null))
			{
				return BadRequest();
			}

			var userId = Request.GetUserId();
			var id = await _universityService.AddDeadlineAsync(userId, addDeadlineViewModel).ConfigureAwait(false);
			return Ok(id);
		}

		[HttpDelete("deadlines/{deadlineId}")]
		public async Task<IActionResult> DeleteDeadlineAsync(long deadlineId)
		{
			var userId = Request.GetUserId();
			await _universityService.DeleteDeadlineAsync(userId, deadlineId).ConfigureAwait(false);
			return Ok();
		}

		[HttpPut("course_works/{courseWorkId}/clear_updated_parameter")]
		public async Task<IActionResult> ClearIsUpdatedInCourseWorkAsync(long courseWorkId)
		{
			await _courseWorksService.SetIsUpdatedInCourseWork(courseWorkId).ConfigureAwait(false);
			return Ok();
		}

		[HttpGet("reviewers")]
		[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserDTO[]))]
		public async Task<IActionResult> GetAllReviewersAsync()
		{
			var usersDTO = await _userService.GetUsersByRoleAsync(Roles.Reviewer)
				.ConfigureAwait(false);
			return Ok(usersDTO);
        }

        [HttpGet("reviewers/bidding")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserDTO[]))]
        public async Task<IActionResult> GetReviewersInBidding()
        {
            var userId = Request.GetUserId();
            var usersDTO = await _reviewService.GetReviewersInBidding(userId).ConfigureAwait(false);
	        return Ok(usersDTO);
        }

        [HttpPost("reviewers/set_to_bidding")]
		public async Task<IActionResult> SetReviewersToBidding([FromBody] ReviewersForBiddingListViewModel reviewersListViewModel)
		{
			var userId = Request.GetUserId();
			await _reviewService.SetReviewersToBidding(userId, reviewersListViewModel.ReviewersId)
				.ConfigureAwait(false);
			return Ok();
		}



		#endregion
	}
}
