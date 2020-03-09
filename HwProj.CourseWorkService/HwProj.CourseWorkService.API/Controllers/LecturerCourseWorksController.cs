using System;
using System.Collections.Generic;
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
    public class LecturerCourseWorksController : Controller
    {
        private readonly IApplicationService _applicationService;
        private readonly IBiddingService _biddingService;
        private readonly ICourseWorkService _courseWorkService;
        private readonly IDeadlineService _deadlineService;
        private readonly IUserService _userService;
        private readonly IMapper _mapper;

        public LecturerCourseWorksController(IApplicationService applicationService, IBiddingService biddingService,
            ICourseWorkService courseWorkService,
            IDeadlineService deadlineService, IUserService userService, IMapper mapper)
        {
            _applicationService = applicationService;
            _biddingService = biddingService;
            _courseWorkService = courseWorkService;
            _deadlineService = deadlineService;
            _userService = userService;
            _mapper = mapper;
        }

        [HttpGet("lecturer_course_works")]
        [ProducesResponseType(typeof(OverviewCourseWork[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetLecturerCourseWorksAsync()
        {
            var id = await _userService.GetIdByAuthId(Request.GetUserId()).ConfigureAwait(false);
            var courseWorks = await _courseWorkService
                .GetFilteredAsync(c => c.LecturerId == id)
                .ConfigureAwait(false);
            return Ok(_mapper.Map<OverviewCourseWork[]>(courseWorks));
        }

        [HttpPost("add_course_work")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddCourseWork([FromBody] CreateCourseWork createCourseWork)
        {
            var courseWork = _mapper.Map<CourseWork>(createCourseWork);
            courseWork.LecturerId = await _userService.GetIdByAuthId(Request.GetUserId()).ConfigureAwait(false);
            courseWork.CreationTime = DateTime.UtcNow;
            var id = await _courseWorkService.AddAsync(courseWork).ConfigureAwait(false);
            return Ok(id);
        }

        [HttpDelete("delete/{courseWorkId}")]
        public async Task<IActionResult> DeleteCourseWork(long courseWorkId)
        {
            await _courseWorkService.DeleteAsync(courseWorkId).ConfigureAwait(false);
            return Ok();
        }

        [HttpPost("update_course_work/{courseWorkId}")]
        public async Task<IActionResult> UpdateCourseWorkAsync([FromBody] CreateCourseWork createCourseWork, long courseWorkId)
        {
            var oldCourseWork = await _courseWorkService.GetAsync(courseWorkId).ConfigureAwait(false);
            var courseWork = _mapper.Map(createCourseWork, oldCourseWork);
            await _courseWorkService.UpdateAsync(courseWorkId, courseWork).ConfigureAwait(false);
            return Ok();
        }

        [HttpGet("applications/{courseWorkId}")]
        [ProducesResponseType(typeof(LecturerOverviewApplication[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseWorkApplications(long courseWorkId)
        {
            var applications = await _applicationService
                .GetFilteredAsync(a => a.CourseWorkId == courseWorkId)
                .ConfigureAwait(false);
            var apps = _mapper.Map<LecturerOverviewApplication[]>(applications);
            for (var i = 0; i < apps.Length; i++)
            {
                apps[i].StudentName = applications[i].Student.Name;
            }
            return Ok(apps);
        }

        [HttpPost("accept_student/{courseWorkId}")]
        public async Task<IActionResult> AcceptStudent(long courseWorkId, [FromQuery] long studentId)
        {
            return await _courseWorkService.AcceptStudentAsync(courseWorkId, studentId).ConfigureAwait(false)
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpPost("reject_student/{courseWorkId}")]
        public async Task<IActionResult> RejectStudent(long courseWorkId, [FromQuery] long studentId)
        {
            return await _courseWorkService.RejectStudentAsync(courseWorkId, studentId).ConfigureAwait(false)
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpPost("add_deadline")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddDeadline([FromBody] AddDeadline addDeadline)
        {
            var deadline = _mapper.Map<Deadline>(addDeadline);
            deadline.CourseWork = await _courseWorkService.GetAsync(deadline.CourseWorkId)
                    .ConfigureAwait(false);
            var id = await _deadlineService.AddAsync(deadline).ConfigureAwait(false);
            return Ok(id);
        }

        [HttpPost("update_deadline")]
        public async Task<IActionResult> UpdateDeadline([FromBody] AddDeadline addDeadline)
        {
            var oldDeadline = await _deadlineService
                .GetFilteredAsync(d => d.CourseWorkId == addDeadline.CourseWorkId && d.Type == addDeadline.Type)
                .ConfigureAwait(false);
            var deadline = _mapper.Map(addDeadline, oldDeadline.First());
            await _deadlineService.UpdateAsync(deadline.Id, deadline).ConfigureAwait(false);
            return Ok();
        }

        [HttpDelete("delete_deadline/{courseWorkId}")]
        public async Task<IActionResult> DeleteDeadline([FromQuery] string type, long courseWorkId)
        {
            var deadline = await _deadlineService
                .GetFilteredAsync(d => d.CourseWorkId == courseWorkId && d.Type == type)
                .ConfigureAwait(false);
            await _deadlineService.DeleteAsync(deadline.First().Id).ConfigureAwait(false);
            return Ok();
        }

        [HttpGet("reviewers/{courseWorkId}")]
        [ProducesResponseType(typeof(Reviewer[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetReviewers(long courseWorkId)
        {
            return Ok(await GetPriorityReviewers(courseWorkId));
        }

        [HttpPost("auto_set_reviewer/{courseWorkId}")]
        public async Task<IActionResult> AutoSetReviewer(long courseWorkId)
        {
            var reviewers = await GetPriorityReviewers(courseWorkId).ConfigureAwait(false);
            var courseWork = await _courseWorkService.GetAsync(courseWorkId).ConfigureAwait(false);
            courseWork.ReviewerId = reviewers.First().Id;
            return Ok();
        }

        [HttpPost("set_reviewer/{courseWorkId}")]
        public async Task<IActionResult> SetReviewer(long courseWorkId, [FromQuery]long reviewerId)
        {
            var courseWork = await _courseWorkService.GetAsync(courseWorkId).ConfigureAwait(false);
            courseWork.ReviewerId = reviewerId;
            return Ok();
        }

        private async Task<Reviewer[]> GetPriorityReviewers(long courseWorkId)
        {
            var courseWork = await _courseWorkService.GetAsync(courseWorkId).ConfigureAwait(false);
            var users = await _userService
                .GetFilteredAsync(u => u.IsReviewer && u.Id != courseWork.StudentId && u.Id != courseWork.LecturerId)
                .ConfigureAwait(false);
            var reviewers = _mapper.Map<Reviewer[]>(users);
            foreach (var reviewer in reviewers)
            {
                var bids = await _biddingService.GetFilteredAsync(b => b.ReviewerId == reviewer.Id)
                    .ConfigureAwait(false);
                reviewer.BidSum = bids.Count(b => b.BidValue == "yes") + 
                                    bids.Count(b => b.BidValue == "maybe") * 0.5;
                var bid = bids.First(b => b.CourseWorkId == courseWorkId);
                reviewer.BidValue = bid != null ? bid.BidValue : "nothing";
            }

            var enumBidValues = new[] {"yes", "maybe", "nothing", "no"};
            var sortedReviewers = new List<Reviewer>();

            foreach (var value in enumBidValues)
            {
                var revs = reviewers.Where(r => r.BidValue == value).ToArray();
                Array.Sort(revs, ((reviewer1, reviewer2) => reviewer2.BidSum.CompareTo(reviewer1.BidSum)));
                sortedReviewers.AddRange(revs);
            }
            return sortedReviewers.ToArray();
        }
    }
}