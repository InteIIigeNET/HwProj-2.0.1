using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CourseWorkService.API.Filters;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories;
using HwProj.CourseWorkService.API.Services;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Authorize]
    [OnlyLecturer]
    [Route("api/lecturer")]
    [ApiController]
    public class LecturerCourseWorksController : Controller
    {
        private readonly IApplicationsService _applicationsService;
        private readonly IApplicationsRepository _applicationsRepository;
        private readonly ICourseWorksService _courseWorksService;
        private readonly ICourseWorksRepository _courseWorksRepository;
        private readonly IDeadlineRepository _deadlineRepository;
        private readonly IMapper _mapper;

        public LecturerCourseWorksController(IApplicationsService applicationsService, IApplicationsRepository applicationsRepository,
            ICourseWorksService courseWorksService, ICourseWorksRepository courseWorksRepository,
            IDeadlineRepository deadlineRepository, IMapper mapper)
        {
            _applicationsService = applicationsService;
            _applicationsRepository = applicationsRepository;
            _courseWorksService = courseWorksService;
            _courseWorksRepository = courseWorksRepository;
            _deadlineRepository = deadlineRepository;
            _mapper = mapper;
        }

        [HttpPost("course_works/add")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddCourseWork([FromBody] CreateCourseWorkViewModel createCourseWorkViewModel)
        {
            var courseWork = _mapper.Map<CourseWork>(createCourseWorkViewModel);
            courseWork.LecturerId = Request.GetUserId();
            courseWork.CreationTime = DateTime.UtcNow;
            var id = await _courseWorksRepository.AddAsync(courseWork).ConfigureAwait(false);
            return Ok(id);
        }

        [HttpDelete("course_works/{courseWorkId}/delete")]
        public async Task<IActionResult> DeleteCourseWork(long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetAsync(courseWorkId).ConfigureAwait(false);
            var userId = Request.GetUserId();
            if (courseWork == null)
            {
                return NotFound();
            }

            if (userId != courseWork.LecturerId)
            {
                return Forbid();
            }
            await _courseWorksRepository.DeleteAsync(courseWorkId).ConfigureAwait(false);
            return Ok();
        }


        [HttpPut("course_works/{courseWorkId}/update")]
        public async Task<IActionResult> UpdateCourseWorkAsync([FromBody] CreateCourseWorkViewModel createCourseWorkViewModel, long courseWorkId)
        {
            var oldCourseWork = await _courseWorksRepository.GetAsync(courseWorkId)
                .ConfigureAwait(false);
            var userId = Request.GetUserId();

            if (oldCourseWork == null)
            {
                return NotFound();
            }

            if (userId != oldCourseWork.LecturerId)
            {
                return Forbid();
            }

            await _courseWorksRepository.UpdateAsync(courseWorkId, cw => new CourseWork()
                {
                    Title = createCourseWorkViewModel.Title,
                    Overview = createCourseWorkViewModel.Overview,
                    Description = createCourseWorkViewModel.Description,
                    Type = createCourseWorkViewModel.Type,
                    Requirements = createCourseWorkViewModel.Requirements,
                    ConsultantName = createCourseWorkViewModel.ConsultantName,
                    ConsultantContact = createCourseWorkViewModel.ConsultantContact,
                    SupervisorName = createCourseWorkViewModel.SupervisorName,
                    SupervisorContact = createCourseWorkViewModel.SupervisorContact
                })
                .ConfigureAwait(false);
            return Ok();
        }

        [HttpGet("applications/{appId}")]
        [ProducesResponseType(typeof(LecturerApplicationDTO), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetLecturerApplication(long appId)
        {
            var application = await _applicationsRepository.GetApplicationAsync(appId).ConfigureAwait(false);
            if (application == null)
            {
                return NotFound();
            }

            return Ok(_applicationsService.GetLecturerApplication(application));
        }

        [HttpGet("course_works/{courseWorkId}/applications")]
        [ProducesResponseType(typeof(OverviewApplicationDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseWorkApplications(long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetAsync(courseWorkId).ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }

            var applications = await _applicationsService
                .GetFilteredApplicationsAsync(app => app.CourseWorkId == courseWorkId)
                .ConfigureAwait(false);
            return Ok(applications);
        }

        [HttpPost("applications/{appId}/accept")]
        public async Task<IActionResult> AcceptStudent(long appId)
        {
            var application = await _applicationsRepository.GetApplicationAsync(appId).ConfigureAwait(false);
            if (application == null)
            {
                return NotFound();
            }

            if (application.CourseWork.StudentId != null)
            {
                return BadRequest();
            }

            await _applicationsService.AcceptStudentApplicationAsync(application);
            return Ok();
        }

        [HttpDelete("applications/{appId}/reject")]
        public async Task<IActionResult> RejectStudent(long appId)
        {
            var application = await _applicationsRepository.GetApplicationAsync(appId).ConfigureAwait(false);
            if (application == null)
            {
                return NotFound();
            }

            await _applicationsRepository.DeleteAsync(application.Id).ConfigureAwait(false);
            return Ok();
        }

        [HttpPost("course_works/{courseWorkId}/deadlines")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddDeadline([FromBody] AddDeadlineViewModel addDeadlineViewModel, long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId).ConfigureAwait(false);
            var userId = Request.GetUserId();
            if (courseWork == null)
            {
                return NotFound();
            }

            if (courseWork.Deadlines.Count(d => d.Type == addDeadlineViewModel.Type) > 0)
            {
                return BadRequest();
            }

            if (userId != courseWork.LecturerId)
            {
                return Forbid();
            }

            var id = await _courseWorksService.AddDeadlineAsync(addDeadlineViewModel, courseWork)
                .ConfigureAwait(false);
            return Ok(id);
        }

        [HttpPut("course_works/{courseWorkId}/deadlines")]
        public async Task<IActionResult> UpdateDeadline([FromBody] AddDeadlineViewModel addDeadlineViewModel, long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId).ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }

            var oldDeadline = courseWork.Deadlines.FirstOrDefault(d => d.Type == addDeadlineViewModel.Type);
            var userId = Request.GetUserId();
            if (oldDeadline == null)
            {
                return BadRequest();
            }

            if (userId != courseWork.LecturerId)
            {
                return Forbid();
            }


            await _deadlineRepository.UpdateAsync(oldDeadline.Id, d => new Deadline()
            {
                Type = addDeadlineViewModel.Type,
                Date = DateTime.ParseExact(addDeadlineViewModel.Date, "dd/MM/yyyy", null)
            }).ConfigureAwait(false);
            return Ok();
        }

        [HttpDelete("course_works/{courseWorkId}/deadlines")]
        public async Task<IActionResult> DeleteDeadline([FromQuery] string type, long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId).ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }

            var oldDeadline = courseWork.Deadlines.FirstOrDefault(d => d.Type == type);
            var userId = Request.GetUserId();
            if (oldDeadline == null)
            {
                return BadRequest();
            }

            if (userId != courseWork.LecturerId)
            {
                return Forbid();
            }

            await _deadlineRepository.DeleteAsync(oldDeadline.Id).ConfigureAwait(false);
            return Ok();
        }

        //    [HttpGet("reviewers/{courseWorkId}")]
        //    [ProducesResponseType(typeof(ReviewerDTO[]), (int)HttpStatusCode.OK)]
        //    public async Task<IActionResult> GetReviewers(long courseWorkId)
        //    {
        //        return Ok(await GetPriorityReviewers(courseWorkId));
        //    }

        //    [HttpPost("auto_set_reviewer/{courseWorkId}")]
        //    public async Task<IActionResult> AutoSetReviewer(long courseWorkId)
        //    {
        //        var reviewers = await GetPriorityReviewers(courseWorkId).ConfigureAwait(false);
        //        var courseWork = await _courseWorkService.GetAsync(courseWorkId).ConfigureAwait(false);
        //        courseWork.ReviewerId = reviewers.First().Id;
        //        return Ok();
        //    }

        //    [HttpPost("set_reviewer/{courseWorkId}")]
        //    public async Task<IActionResult> SetReviewer(long courseWorkId, [FromQuery]long reviewerId)
        //    {
        //        var courseWork = await _courseWorkService.GetAsync(courseWorkId).ConfigureAwait(false);
        //        courseWork.ReviewerId = reviewerId;
        //        return Ok();
        //    }

        //    private async Task<ReviewerDTO[]> GetPriorityReviewers(long courseWorkId)
        //    {
        //        var courseWork = await _courseWorkService.GetAsync(courseWorkId).ConfigureAwait(false);
        //        var users = await _userService
        //            .GetFilteredAsync(u => u.IsReviewer && u.Id != courseWork.StudentId && u.Id != courseWork.LecturerId)
        //            .ConfigureAwait(false);
        //        var reviewers = _mapper.Map<ReviewerDTO[]>(users);
        //        foreach (var reviewer in reviewers)
        //        {
        //            var bids = await _biddingService.GetFilteredAsync(b => b.ReviewerId == reviewer.Id)
        //                .ConfigureAwait(false);
        //            reviewer.BidSum = bids.Count(b => b.BidValue == "yes") + 
        //                                bids.Count(b => b.BidValue == "maybe") * 0.5;
        //            var bid = bids.First(b => b.CourseWorkId == courseWorkId);
        //            reviewer.BidValue = bid != null ? bid.BidValue : "nothing";
        //        }

        //        var enumBidValues = new[] {"yes", "maybe", "nothing", "no"};
        //        var sortedReviewers = new List<ReviewerDTO>();

        //        foreach (var value in enumBidValues)
        //        {
        //            var revs = reviewers.Where(r => r.BidValue == value).ToArray();
        //            Array.Sort(revs, ((reviewer1, reviewer2) => reviewer2.BidSum.CompareTo(reviewer1.BidSum)));
        //            sortedReviewers.AddRange(revs);
        //        }
        //        return sortedReviewers.ToArray();
        //    }
    }
}