using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class RegistrationRequestsService : IRegistrationRequestsService
    {
        private readonly IRegistrationRequestsRepository _requestsRepository;
        private readonly ICoursesRepository _coursesRepository;
        private readonly ICoursesService _coursesService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;
        private readonly IEventBus _eventBus;
        
        public RegistrationRequestsService(
            IRegistrationRequestsRepository requestsRepository,
            ICoursesRepository coursesRepository,
            ICoursesService coursesService,
            IAuthServiceClient authServiceClient,
            IMapper mapper,
            IEventBus eventBus)
        {
            _requestsRepository = requestsRepository;
            _coursesRepository = coursesRepository;
            _coursesService = coursesService;
            _authServiceClient = authServiceClient;
            _mapper = mapper;
            _eventBus = eventBus;
        }

        public async Task<Result<long>> CreateRequestAsync(CreateRegistrationRequestViewModel model)
        {
            var email = model.Email.Trim();

            var userId = await _authServiceClient.FindByEmailAsync(email).ConfigureAwait(false);
            if (!string.IsNullOrWhiteSpace(userId))
            {
                return Result<long>.Failed("Пользователь уже зарегистрирован, войдите в аккаунт");
            }
                        
            var existingRequest = await _requestsRepository.GetPendingByEmailAsync(email).ConfigureAwait(false);
            if (existingRequest != null)
            {
                return Result<long>.Failed("У вас уже есть активная заявка");
            }
            
            if (model.CourseId != null)
            {
                var course = await _coursesRepository.GetAsync(model.CourseId!.Value).ConfigureAwait(false);
                if (course == null)
                {
                    return Result<long>.Failed("Курс не найден");
                } 
            }
            
            var now = DateTime.UtcNow;
            var request = new RegistrationRequest
            {
                Email = email,
                Name = model.Name.Trim(),
                Surname = model.Surname.Trim(),
                MiddleName = model.MiddleName.Trim(),
                CourseId = model.CourseId,
                Status = RegistrationRequestStatus.Pending,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            };

            var id = await _requestsRepository.AddAsync(request).ConfigureAwait((false));
            return Result<long>.Success(id);
        }

        public async Task<Result<RegistrationRequestDto[]>> GetCourseRequestsAsync(long courseId, string reviewerId)
        {
            var validationResult = await EnsureCourseLecturerAsync(courseId, reviewerId).ConfigureAwait(false);
            if (!validationResult.Succeeded) 
            {
                return Result<RegistrationRequestDto[]>.Failed(validationResult.Errors.FirstOrDefault()!);
            }
            
            var requests = await _requestsRepository.FindAll(r => r.CourseId == courseId)
                .OrderByDescending(r => r.CreatedAtUtc)
                .ToArrayAsync()
                .ConfigureAwait(false);

            var dtos = requests.Select(r => _mapper.Map<RegistrationRequestDto>(r)).ToArray();
            return Result<RegistrationRequestDto[]>.Success(dtos);
        }

        public async Task<Result<RegistrationRequestDto[]>> GetGeneralRequestsAsync(string reviewerId)
        {
            var reviewer = await _authServiceClient.GetAccountData(reviewerId).ConfigureAwait(false);
            if (reviewer.Role != Roles.LecturerRole)
            {
                return Result<RegistrationRequestDto[]>.Failed("Нет прав просматривать общие заявки");
            }
            
            var requests = await _requestsRepository.FindAll(r => 
                    r.Status == RegistrationRequestStatus.Pending &&
                    r.CourseId == null)
                .OrderByDescending(r => r.CreatedAtUtc)
                .ToArrayAsync()
                .ConfigureAwait(false);

            var dtos = requests.Select(r => _mapper.Map<RegistrationRequestDto>(r)).ToArray();
            return Result<RegistrationRequestDto[]>.Success(dtos);
        }

        // public async Task<Result<RegistrationRequestDto?>> GetRequestByEmailAsync(string email)
        // {
        //     var normalizedEmail = email.Trim();
        //     var pendingRequest = await _requestsRepository.GetPendingByEmailAsync(normalizedEmail).ConfigureAwait(false);
        //     if (pendingRequest == null) 
        //     {
        //         return Result<RegistrationRequestDto?>.Success(null);
        //     }
        //
        //     var dto = _mapper.Map<RegistrationRequestDto>(pendingRequest);
        //     return Result<RegistrationRequestDto?>.Success(dto);
        // }

        public async Task<Result<string>> ApproveAsync(long requestId, string reviewerId)
        {
            var request = await _requestsRepository.GetAsync(requestId).ConfigureAwait(false);
            if (request == null)
            {
                return Result<string>.Failed("Заявка не найдена");
            }

            if (request.Status != RegistrationRequestStatus.Pending)
            {
                return Result<string>.Failed("Заявка уже обработана");
            }

            if (request.CourseId != null)
            {
                var validationResult = await EnsureCourseLecturerAsync(request.CourseId.Value, reviewerId).ConfigureAwait(false);
                if (!validationResult.Succeeded)
                {
                    return Result<string>.Failed(validationResult.Errors.FirstOrDefault());
                }
            }
            else
            {
                var reviewer = await _authServiceClient.GetAccountData(reviewerId).ConfigureAwait(false);
                if (reviewer.Role != Roles.LecturerRole)
                {
                    return Result<string>.Failed("Нет прав проверять общие заявки");
                }
            }

            var userId = await _authServiceClient.FindByEmailAsync(request.Email).ConfigureAwait(false);
            if (string.IsNullOrWhiteSpace(userId))
            {
                var registerResult = await _authServiceClient.Register(new RegisterViewModel
                {
                    Email = request.Email,
                    Name = request.Name,
                    Surname = request.Surname,
                    MiddleName = request.MiddleName
                });

                if (!registerResult.Succeeded)
                {
                    return Result<string>.Failed(registerResult.Errors.FirstOrDefault() ??
                                                 "Не удалось зарегистрировать пользователя");
                }

                userId = registerResult.Value;
            }

            if (request.CourseId != null)
            {
                var addResult = await _coursesService.AddStudentAsync(
                    request.CourseId.Value,
                    userId).ConfigureAwait(false);

                if (!addResult)
                {
                    return Result<string>.Failed("Ошибка зачисления на курс");
                }

                var acceptResult = await _coursesService.AcceptCourseMateAsync(request.CourseId.Value, userId).ConfigureAwait(false);
                if (!acceptResult)
                {
                    return Result<string>.Failed("Ошибка подтверждения зачисления на курс");
                }
            }

            var now = DateTime.UtcNow;
            await _requestsRepository.UpdateAsync(requestId, _ => new RegistrationRequest
            {
                Status = RegistrationRequestStatus.Approved,
                ReviewedAtUtc = now,
                ReviewedByUserId = reviewerId,
                UpdatedAtUtc = now,
                ResolvedUserId = userId,
                RejectReason = null
            }).ConfigureAwait(false);

            return Result<string>.Success(userId);
        }

        public async Task<Result> RejectAsync(long requestId, string reviewerId, string? rejectReason)
        {
            var request = await _requestsRepository.GetAsync(requestId).ConfigureAwait(false);
            if (request == null)
            {
                return Result.Failed("Заявка не найдена");
            }

            if (request.Status != RegistrationRequestStatus.Pending)
            {
                return Result.Failed("Заявка уже обработана");
            }

            if (request.CourseId != null)
            {
                var validationResult = await EnsureCourseLecturerAsync(request.CourseId.Value, reviewerId).ConfigureAwait(false);
                if (!validationResult.Succeeded)
                {
                    return validationResult;
                }
            }
            else
            {
                var reviewer = await _authServiceClient.GetAccountData(reviewerId).ConfigureAwait(false);
                if (reviewer.Role != Roles.LecturerRole)
                {
                    return Result.Failed("Нет прав проверять общие заявки");
                }
            }

            var now = DateTime.UtcNow;
            await _requestsRepository.UpdateAsync(requestId, _ => new RegistrationRequest
            {
                Status = RegistrationRequestStatus.Rejected,
                ReviewedAtUtc = now,
                ReviewedByUserId = reviewerId,
                UpdatedAtUtc = now,
                RejectReason = string.IsNullOrWhiteSpace(rejectReason) ? null : rejectReason.Trim()
            }).ConfigureAwait(false);

            return Result.Success();
        }
        
        private async Task<Result> EnsureCourseLecturerAsync(long courseId, string lecturerId)
        {
            var course = await _coursesRepository.GetAsync(courseId).ConfigureAwait(false);
            if (course == null)
            {
                return Result.Failed("Курс с таким id не найден");
            }

            if (!course.MentorIds.Contains(lecturerId))
            {
                return Result.Failed("Нет прав управлять заявками этого курса");
            }
            
            return Result.Success();
        }
    }
}