using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.Models.CoursesService.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Services
{
    public class CriterionsService : ICriterionsService
    {
        private readonly ICriterionsRepository _criteriaRepository;
        private readonly IHomeworksRepository _homeworksRepository;

        public CriterionsService(ICriterionsRepository criteriaRepository, IHomeworksRepository homeworksRepository)
        {
            _criteriaRepository = criteriaRepository;
            _homeworksRepository = homeworksRepository;
        }


        public async Task AddCriterionsAsync(CreateHomeworkViewModel homeworkViewModel, IReadOnlyList<HomeworkTask> tasks)
        {

            if (homeworkViewModel?.Tasks is null || tasks is null)
            {
                return;
            }

            var taskViewModels = homeworkViewModel.Tasks.ToList();
            var taskCount = Math.Min(taskViewModels.Count, tasks.Count);

            var criteriaToAdd = new List<Criterions>();

            for (var i = 0; i < taskCount; i++)
            {
                var taskViewModel = taskViewModels[i];
                var task = tasks[i];

                if (taskViewModel.Criterias == null)
                {
                    continue;
                }

                foreach (var criterionVm in taskViewModel.Criterias)
                {
                    criteriaToAdd.Add(new Criterions
                    {
                        TaskId = task.Id,
                        Type = criterionVm.Type,
                        Name = criterionVm.Name,
                        Points = criterionVm.Points
                    });
                }
            }

            if (criteriaToAdd.Count == 0)
            {
                return;
            }

            await _criteriaRepository.AddRangeAsync(criteriaToAdd);


        }

        public async Task AddCriterionAsync(List<CriterionViewModel>? criterias, long taskId)
        {
            if (criterias == null || criterias.Count == 0)
            {
                return;
            }

            var entities = criterias.Select(crit => new Criterions
            {
                TaskId = taskId,
                Type = crit.Type,
                Points = crit.Points,
                Name = crit.Name
            }).ToList();

            await _criteriaRepository.AddRangeAsync(entities);
        }

        public async Task UpdateTaskCriteriaAsync(CreateTaskViewModel taskViewModel, long taskId)
        {
            var criterions = taskViewModel.Criterias?.ToArray() ?? Array.Empty<CriterionViewModel>();

            var dbCriterions = await _criteriaRepository.GetByTaskIdAsync(taskId);

            var existing = criterions
                .Where(c => c.Id > 0)
                .ToList();

            var toAdd = criterions
                .Where(c => c.Id <= 0)
                .Select(crit => new Criterions
                {
                    TaskId = taskId,
                    Type = crit.Type,
                    Points = crit.Points,
                    Name = crit.Name
                })
                .ToList();

            foreach (var crit in existing)
            {
                await _criteriaRepository.UpdateAsync(crit.Id, t => new Criterions
                {
                    Name = crit.Name,
                    Points = crit.Points
                });
            }

            if (toAdd.Count > 0)
            {
                await _criteriaRepository.AddRangeAsync(toAdd);
            }

            var incomingIds = existing
                .Select(c => c.Id)
                .ToHashSet();

            var toDelete = dbCriterions
                .Where(dbCrit => !incomingIds.Contains(dbCrit.Id))
                .ToList();

            foreach (var dbCrit in toDelete)
            {
                await _criteriaRepository.DeleteAsync(dbCrit.Id);
            }
        }

        public async Task<List<CriterionViewModel>> GetTaskCriteriaAsync(long taskId)
        {
            var criteria = await _criteriaRepository.GetByTaskIdAsync(taskId);

            if (criteria == null)
            {
                return new List<CriterionViewModel>();
            }

            return criteria
                .Select(c => new CriterionViewModel
                {
                    Id = c.Id,
                    Type = c.Type,
                    Name = c.Name,
                    Points = c.Points
                })
                .ToList();
        }


        public async Task DeleteCriteriaByTaskIdAsync(long taskId)
        {
            var criteria = await _criteriaRepository.GetByTaskIdAsync(taskId);

            if (criteria == null)
            {
                return;
            }

            foreach (var criterion in criteria)
            {
                await _criteriaRepository.DeleteAsync(criterion.Id);
            }
        }

        public async Task DeleteCriteriaFromHomeworkAsync(long homeworkId)
        {
            var homework = await _homeworksRepository.GetWithTasksAsync(homeworkId);

            if (homework?.Tasks == null || !homework.Tasks.Any())
            {
                return;
            }

            foreach (var task in homework.Tasks)
            {
                await DeleteCriteriaByTaskIdAsync(task.Id);
            }
        }
    }
}
