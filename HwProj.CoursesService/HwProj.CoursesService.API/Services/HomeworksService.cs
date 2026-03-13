using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.CoursesService.API.Domains;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.NotificationService.Events.CoursesService;
using HwProj.CoursesService.API.Repositories.Groups;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace HwProj.CoursesService.API.Services
{
    public class HomeworksService : IHomeworksService
    {
        private readonly IHomeworksRepository _homeworksRepository;
        private readonly IEventBus _eventBus;
        private readonly ICoursesRepository _coursesRepository;
        private readonly IGroupMatesRepository _groupMatesRepository;
        private readonly ICourseFilterRepository _courseFilterRepository;

        public HomeworksService(IHomeworksRepository homeworksRepository, IEventBus eventBus, ICoursesRepository coursesRepository,
            IGroupMatesRepository groupMatesRepository, IGroupsService groupsService, ICourseFilterRepository courseFilterRepository)
        {
            _homeworksRepository = homeworksRepository;
            _eventBus = eventBus;
            _coursesRepository = coursesRepository;
            _groupMatesRepository = groupMatesRepository;
            _courseFilterRepository = courseFilterRepository;
        }

        public async Task<Homework> AddHomeworkAsync(long courseId, CreateHomeworkViewModel homeworkViewModel)
        {
            homeworkViewModel.Tags = homeworkViewModel.Tags.Where(t => !string.IsNullOrWhiteSpace(t)).ToList();
            var homework = homeworkViewModel.ToHomework();
            homework.CourseId = courseId;

            var course = await _coursesRepository.GetWithCourseMatesAndHomeworksAsync(courseId);
            var notificationStudentIds = course.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();

            await _homeworksRepository.AddAsync(homework);

            if(homework.GroupId != null)
            {
                var groupMates = await _groupMatesRepository.FindAll(gm => gm.GroupId == homework.GroupId).ToListAsync();
                await UpdateGroupFilters(courseId, homework.Id, groupMates);
                notificationStudentIds = groupMates.Select(gm => gm.StudentId).ToArray();
            }

            if (DateTime.UtcNow >= homework.PublicationDate)
            {
                _eventBus.Publish(new NewHomeworkEvent(homework.Title, course.Name, course.Id, notificationStudentIds,
                    homework.DeadlineDate));
            }

            return await GetHomeworkAsync(homework.Id, withCriteria: true);
        }

        public async Task<Homework> GetHomeworkAsync(long homeworkId, bool withCriteria = false)
        {
            var homework = await _homeworksRepository.GetWithTasksAsync(homeworkId, withCriteria);

            CourseDomain.FillTasksInHomework(homework);

            return homework;
        }

        public async Task<Homework> GetForEditingHomeworkAsync(long homeworkId)
        {
            var result = await _homeworksRepository.GetWithTasksAsync(homeworkId);
            return result;
        }

        public async Task DeleteHomeworkAsync(long homeworkId)
        {
            await _homeworksRepository.DeleteAsync(homeworkId);
        }

        public async Task<Homework> UpdateHomeworkAsync(long homeworkId, CreateHomeworkViewModel homeworkViewModel)
        {
            homeworkViewModel.Tags = homeworkViewModel.Tags.Where(t => !string.IsNullOrWhiteSpace(t)).ToList();
            var update = homeworkViewModel.ToHomework();
            var options = homeworkViewModel.ActionOptions ?? ActionOptions.Default;

            var homework = await _homeworksRepository.GetAsync(homeworkId);
            var course = await _coursesRepository.GetWithCourseMates(homework.CourseId);
            var studentIds = course!.CourseMates.Where(cm => cm.IsAccepted).Select(cm => cm.StudentId).ToArray();

            if (options.SendNotification && update.PublicationDate <= DateTime.UtcNow)
            {
                var notificationStudentIds = studentIds;

                if (update.GroupId != null)
                {
                    var groupMates = await _groupMatesRepository.FindAll(gm => gm.GroupId == update.GroupId).ToListAsync();
                    notificationStudentIds = groupMates.Select(gm => gm.StudentId).ToArray();
                }

                _eventBus.Publish(new UpdateHomeworkEvent(update.Title, course.Id, course.Name, notificationStudentIds));
            }

            await _homeworksRepository.UpdateAsync(homeworkId, hw => new Homework()
            {
                Title = update.Title,
                Description = update.Description,
                HasDeadline = update.HasDeadline,
                DeadlineDate = update.DeadlineDate,
                PublicationDate = update.PublicationDate,
                IsDeadlineStrict = update.IsDeadlineStrict,
                Tags = update.Tags,
                GroupId = update.GroupId
            });

            var updatedHomework = await _homeworksRepository.GetWithTasksAsync(homeworkId);
            CourseDomain.FillTasksInHomework(updatedHomework);
            return updatedHomework;
        }

        private async Task UpdateGroupFilters(long courseId, long homeworkId, List<GroupMate> groupMates)
        {
            // Добавление группового домашнего задания в глобальный фильтр курса
            var globalFilter = await _courseFilterRepository.GetAsync("", courseId);

            if (globalFilter != null)
            {
                var filter = globalFilter.Filter;
                if (!filter.HomeworkIds.Contains(homeworkId))
                {
                    filter.HomeworkIds.Add(homeworkId);
                }

                await _courseFilterRepository.UpdateAsync(globalFilter.Id, f =>
                    new CourseFilter
                    {
                        FilterJson = new CourseFilter { Filter = filter }.FilterJson
                    });
            }
            else
            {
                var newFilter = new Filter
                {
                    StudentIds = new List<string>(),
                    HomeworkIds = new List<long> { homeworkId },
                    MentorIds = new List<string>(),
                };

                await _courseFilterRepository.AddAsync(new CourseFilter { Filter = newFilter }, "", courseId);
            }

            // Добавление группового домашнего задания в персональные фильтры участников группы
            foreach (var groupMate in groupMates)
            {
                var studentFilter = await _courseFilterRepository.GetAsync(groupMate.StudentId, courseId);

                if (studentFilter != null)
                {
                    var filter = studentFilter.Filter;
                    if (!filter.HomeworkIds.Contains(homeworkId))
                    {
                        filter.HomeworkIds.Add(homeworkId);
                    }

                    await _courseFilterRepository.UpdateAsync(studentFilter.Id, f =>
                        new CourseFilter
                        {
                            FilterJson = new CourseFilter { Filter = filter }.FilterJson
                        });
                }
                else
                {
                    var newFilter = new Filter
                    {
                        StudentIds = new List<string>(),
                        HomeworkIds = new List<long> { homeworkId },
                        MentorIds = new List<string>()
                    };

                    await _courseFilterRepository.AddAsync(
                        new CourseFilter { Filter = newFilter },
                        groupMate.StudentId,
                        courseId
                    );
                }
            }
        }
    }
}
