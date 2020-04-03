using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Services;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewerCourseWorksController : ControllerBase
    {
        //private readonly IBiddingService _biddingService;
        //private readonly ICourseWorksService _courseWorkService;
        //private readonly IUserService _userService;
        //private readonly IMapper _mapper;

        //public ReviewerCourseWorksController(IBiddingService biddingService, ICourseWorksService courseWorkService,
        //    IUserService userService, IMapper mapper)
        //{
        //    _biddingService = biddingService;
        //    _courseWorkService = courseWorkService;
        //    _userService = userService;
        //    _mapper = mapper;
        //}

        //[HttpPost("cease_to_be_reviewer")]
        //public async Task<IActionResult> CeaseToBeReviewer()
        //{
        //    var user = await _userService.GetUserAuthAsync(Request.GetUserId())
        //        .ConfigureAwait(false);
        //    user.IsReviewer = false;
        //    return Ok();
        //}

        //[HttpGet]
        //[ProducesResponseType(typeof(OverviewCourseWorkDTO[]), (int)HttpStatusCode.OK)]
        //public async Task<IActionResult> GetAvailableCourseWorks()
        //{
        //    var courseWorks = await _courseWorkService
        //        .GetFilteredAsync(c => c.StudentId != null)
        //        .ConfigureAwait(false);
        //    return Ok(_mapper.Map<OverviewCourseWorkDTO[]>(courseWorks));
        //}

        //[HttpPost("create_bid")]
        //[ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        //public async Task<IActionResult> CreateBid([FromBody]CreateBidViewModel createBidViewModel)
        //{
        //    var bid = _mapper.Map<Bid>(createBidViewModel);
        //    bid.ReviewerId = await _userService.GetIdByAuthId(Request.GetUserId())
        //        .ConfigureAwait(false);
        //    bid.CourseWork = await _courseWorkService.GetAsync(bid.CourseWorkId)
        //        .ConfigureAwait(false);
        //    var id = await _biddingService.AddAsync(bid).ConfigureAwait(false);
        //    return Ok(id);
        //}

        //[HttpDelete("delete_bid/{courseWorkId}")]
        //public async Task<IActionResult> DeleteDeadline(long courseWorkId)
        //{
        //    var id = await _userService.GetIdByAuthId(Request.GetUserId()).ConfigureAwait(false);
        //    var bid = await _biddingService
        //        .GetFilteredAsync(d => d.CourseWorkId == courseWorkId && d.ReviewerId == id)
        //        .ConfigureAwait(false);
        //    await _biddingService.DeleteAsync(bid.First().Id).ConfigureAwait(false);
        //    return Ok();
        //}
    }
}