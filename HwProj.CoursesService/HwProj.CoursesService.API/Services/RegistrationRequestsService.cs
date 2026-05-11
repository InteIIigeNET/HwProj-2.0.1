using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using HwProj.NotificationService.Events.CoursesService;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class RegistrationRequestsService : IRegistrationRequestsService
    {
        private static readonly TimeSpan DraftLifetime = TimeSpan.FromHours(24);
        
        private readonly IRegistrationRequestsRepository _requestsRepository;
        private readonly IRegistrationRequestDraftsRepository _draftsRepository;
        private readonly ICoursesRepository _coursesRepository;
        private readonly ICoursesService _coursesService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IMapper _mapper;
        private readonly IEventBus _eventBus;
        
        public RegistrationRequestsService(
            IRegistrationRequestsRepository requestsRepository,
            IRegistrationRequestDraftsRepository draftsRepository,
            ICoursesRepository coursesRepository,
            ICoursesService coursesService,
            IAuthServiceClient authServiceClient,
            IMapper mapper,
            IEventBus eventBus)
        {
            _requestsRepository = requestsRepository;
            _draftsRepository = draftsRepository;
            _coursesRepository = coursesRepository;
            _coursesService = coursesService;
            _authServiceClient = authServiceClient;
            _mapper = mapper;
            _eventBus = eventBus;
        }

        public async Task<Result> InitRequestAsync(InitRegistrationRequestViewModel model)
        {
            var email = model.Email.Trim();

            if (model.RequestedRole == RequestedRole.Lecturer && model.CourseId != null)
            {
                return Result.Failed("Заявка преподавателя не может быть привязана к курсу");
            }
            
            var userId = await _authServiceClient.FindByEmailAsync(email).ConfigureAwait(false);
            if (!string.IsNullOrWhiteSpace(userId))
            {
                return Result.Failed("Пользователь уже зарегистрирован, войдите в аккаунт");
            }
                        
            var existingRequest = await _requestsRepository.GetPendingByEmailAsync(email).ConfigureAwait(false);
            if (existingRequest != null)
            {
                return Result.Failed("У вас уже есть активная заявка");
            }
            
            if (model.CourseId != null)
            {
                var course = await _coursesRepository.GetAsync(model.CourseId!.Value).ConfigureAwait(false);
                if (course == null)
                {
                    return Result.Failed("Курс не найден");
                } 
            }

            var description = string.IsNullOrWhiteSpace(model.Description)
                ? null
                : model.Description.Trim();
            var preferredLecturerEmail = string.IsNullOrWhiteSpace(model.PreferredLecturerEmail)
                ? null
                : model.PreferredLecturerEmail.Trim();
            var now = DateTime.UtcNow;
            var name = model.Name.Trim();
            var surname = model.Surname.Trim();
            var middleName = model.MiddleName.Trim();
            
            var existingDraft = await _draftsRepository.GetUnconfirmedByEmailAsync(email).ConfigureAwait(false);
            if (existingDraft != null)
            {
                if (existingDraft.ExpiresAtUtc > now)
                {
                    return Result.Failed("Подтверждение уже отправлено на эту почту");
                }

                var newToken = Guid.NewGuid().ToString();

                await _draftsRepository.UpdateAsync(existingDraft.Id, _ => new RegistrationRequestDraft
                {
                    Description = description,
                    PreferredLecturerEmail = preferredLecturerEmail,
                    Email = email,
                    Name = name,
                    Surname = surname,
                    MiddleName = middleName,
                    CourseId = model.CourseId,
                    RequestedRole = model.RequestedRole,
                    ConfirmationToken = newToken,
                    CreatedAtUtc = now,
                    ExpiresAtUtc = now.Add(DraftLifetime),
                    IsConfirmed = false
                }).ConfigureAwait(false);

                _eventBus.Publish(new RegistrationRequestConfirmationEvent
                {
                    Email = email,
                    Name = name,
                    Surname = surname,
                    Token = newToken
                });

                return Result.Success();
            }
            
            var token = Guid.NewGuid().ToString();
            
            var draft = new RegistrationRequestDraft
            {
                Description = description,
                PreferredLecturerEmail = preferredLecturerEmail,
                Email = email,
                Name = name,
                Surname = surname,
                MiddleName = middleName,
                CourseId = model.CourseId,
                RequestedRole = model.RequestedRole,
                ConfirmationToken = token,
                CreatedAtUtc = now,
                ExpiresAtUtc = now.Add(DraftLifetime),
                IsConfirmed = false
            };

            await _draftsRepository.AddAsync(draft).ConfigureAwait(false);

            _eventBus.Publish(new RegistrationRequestConfirmationEvent
            {
                Email = draft.Email,
                Name = draft.Name,
                Surname = draft.Surname,
                Token = draft.ConfirmationToken
            });
            
            return Result.Success();
        }

        public async Task<Result<long>> ConfirmRequestAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return Result<long>.Failed("Некорректный токен подтверждения");
            }

            var draft = await _draftsRepository.GetByTokenAsync(token.Trim()).ConfigureAwait(false);
            if (draft == null)
            {
                return Result<long>.Failed("Ссылка подтверждения недействительна");
            }

            if (draft.IsConfirmed)
            {
                return Result<long>.Failed("Заявка уже подтверждена");
            }

            if (draft.ExpiresAtUtc <= DateTime.UtcNow)
            {
                return Result<long>.Failed("Срок действия ссылки истёк");
            }

            if (draft.RequestedRole == RequestedRole.Lecturer && draft.CourseId != null)
            {
                return Result<long>.Failed("Заявка преподавателя не может быть привязана к курсу");
            }
            
            var userId = await _authServiceClient.FindByEmailAsync(draft.Email).ConfigureAwait(false);
            if (!string.IsNullOrWhiteSpace(userId))
            {
                return Result<long>.Failed("Пользователь уже зарегистрирован, войдите в аккаунт");
            }
            
            var existingRequest = await _requestsRepository.GetPendingByEmailAsync(draft.Email).ConfigureAwait(false);
            if (existingRequest != null)
            {
                return Result<long>.Failed("У вас уже есть активная заявка");
            }

            Course course = null;
            if (draft.CourseId != null)
            {
                course = await _coursesRepository.GetAsync(draft.CourseId.Value).ConfigureAwait(false);
                if (course == null)
                {
                    return Result<long>.Failed("Курс не найден");
                }
            }

            var now = DateTime.UtcNow;
            var request = new RegistrationRequest
            {
                Description = draft.Description,
                PreferredLecturerEmail = draft.PreferredLecturerEmail,
                Email = draft.Email,
                Name = draft.Name,
                Surname = draft.Surname,
                MiddleName = draft.MiddleName,
                CourseId = draft.CourseId,
                RequestedRole = draft.RequestedRole,
                Status = RegistrationRequestStatus.Pending,
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
            };

            var requestId = await _requestsRepository.AddAsync(request).ConfigureAwait(false);

            await _draftsRepository.UpdateAsync(draft.Id, _ => new RegistrationRequestDraft
            {
                IsConfirmed = true
            }).ConfigureAwait(false);

            _eventBus.Publish(new RegistrationRequestCreatedEvent
            {
                RegistrationRequestId = requestId,
                CourseId = request.CourseId,
                Email = request.Email,
                Name = request.Name,
                Surname = request.Surname,
                CourseName = course?.Name ?? string.Empty,
                RequestedRole = request.RequestedRole.ToString(),
                MentorIds = course?.MentorIds ?? string.Empty
                
            });

            return Result<long>.Success(requestId);
        }

        public async Task<Result<RegistrationRequestDto[]>> GetCourseRequestsAsync(long courseId, string reviewerId)
        {
            var validationResult = await EnsureCourseLecturerAsync(courseId, reviewerId).ConfigureAwait(false);
            if (!validationResult.Succeeded) 
            {
                return Result<RegistrationRequestDto[]>.Failed(validationResult.Errors.FirstOrDefault()!);
            }
            
            var requests = await _requestsRepository.FindAll(r => 
                    r.CourseId == courseId  &&
                    r.Status == RegistrationRequestStatus.Pending
                )
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

        public async Task<Result<string>> ApproveAsync(long requestId, string reviewerId)
        {
            var request = await _requestsRepository.GetAsync(requestId).ConfigureAwait(false);
            if (request == null)
            {
                return Result<string>.Failed("Заявка не найдена");
            }

            if (request.RequestedRole == RequestedRole.Lecturer && request.CourseId != null)
            {
                return Result<string>.Failed("Заявка преподавателя не может быть привязана к курсу");
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
                Result<string> registerResult;

                if (request.RequestedRole == RequestedRole.Student)
                {
                    registerResult = await _authServiceClient.RegisterStudent(new RegisterViewModel
                    {
                        Email = request.Email,
                        Name = request.Name,
                        Surname = request.Surname,
                        MiddleName = request.MiddleName
                    }).ConfigureAwait(false);

                }
                else
                {
                    registerResult = await _authServiceClient.RegisterLecturer(new RegisterViewModel
                    {
                        Email = request.Email,
                        Name = request.Name,
                        Surname = request.Surname,
                        MiddleName = request.MiddleName
                    }).ConfigureAwait(false);
                }

                if (!registerResult.Succeeded)
                {
                    return Result<string>.Failed(registerResult.Errors.FirstOrDefault() ??
                                                 "Не удалось зарегистрировать пользователя");
                }

                userId = registerResult.Value;
            }

            if (request.CourseId != null && request.RequestedRole == RequestedRole.Student)
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
            
            _eventBus.Publish(new RegistrationRequestRejectedEvent
            {
                Email = request.Email,
                Name = request.Name,
                Surname = request.Surname,
                RejectReason = string.IsNullOrWhiteSpace(rejectReason) ? string.Empty : rejectReason.Trim()
            });

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