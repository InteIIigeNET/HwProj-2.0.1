using System;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Filters;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Services.Interfaces;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Authorize]
    [Route("api/reviewer")]
    [TypeFilter(typeof(OnlySelectRoleAttribute), Arguments = new object[] { Roles.Reviewer })]
    [ApiController]
    public class ReviewerCourseWorksController : ControllerBase
    {
	    #region Fields: Private

	    private readonly IReviewService _reviewService;

	    #endregion

	    #region Constructors: Public

	    public ReviewerCourseWorksController(IReviewService reviewService)
	    {
		    _reviewService = reviewService;
	    }

		#endregion

		#region Methods: Public

		[HttpGet("course_works_in_bidding")]
		[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ReviewerOverviewCourseWorkDTO[]))]
		public async Task<IActionResult> GetCourseWorksInBidding()
		{
			var userId = Request.GetUserIdFromHeader();
			var courseWorksDTO = await _reviewService.GetCourseWorksInBiddingForReviewer(userId)
				.ConfigureAwait(false);
			return Ok(courseWorksDTO);
		}

		[HttpPost("bidding/{courseWorkId}/{biddingValueString}")]
		public async Task<IActionResult> CreateCourseWorkBid(long courseWorkId, string biddingValueString)
		{
			if (!Enum.TryParse<BiddingValues>(biddingValueString, out var biddingValue))
			{
				return NotFound();
			}
			var userId = Request.GetUserIdFromHeader();

			await _reviewService.CreateCourseWorkBid(userId, courseWorkId, biddingValue).ConfigureAwait(false);
			return Ok();
		}


		#endregion
	}
}
