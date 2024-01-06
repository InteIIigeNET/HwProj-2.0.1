using System;
using System.Collections.Generic;
using System.Linq;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Domains
{
    public static class Validator
    {
        public static List<string> ValidateTask(CreateTaskViewModel task, Homework homework,
            HomeworkTask? previousState = null)
        {
            var errors = new List<string>();

            if (task.PublicationDate != null && task.PublicationDate < homework.PublicationDate)
            {
                errors.Add("Дата публикации задачи не может быть раньше даты публикации домашнего задания");
            }

            if (previousState != null
                && task.PublicationDate != null
                && previousState.PublicationDate <= DateTime.UtcNow
                && task.PublicationDate != previousState.PublicationDate)
            {
                errors.Add("Нельзя изменить дату публикации задачи, если она уже показана студентам");
            }

            if (task.HasDeadline is null && !homework.HasDeadline && task.DeadlineDate != null)
            {
                errors.Add("DeadlineDate не может принимать какое-либо значение, если задача не переопределяет HasDeadline и в домашнем задании нет дедлайна");
            }

            if (task.HasDeadline == false && task.DeadlineDate != null)
            {
                errors.Add("DeadlineDate не может принимать какое-либо значение, если у задачи нет дедлайна");
            }

            if (task.HasDeadline == true && task.DeadlineDate is null && !homework.HasDeadline)
            {
                errors.Add(
                    "HasDeadline не может принимать значение true, значение DeadlineDate не переопределено и при этом у домашнего задания нет дедлайна");
            }

            if (task.DeadlineDate is { } deadlineDate && deadlineDate < homework.PublicationDate)
            {
                errors.Add("Дедлайн задачи не может быть раньше даты публикации домашнего задания");
            }
            else if (task.PublicationDate > task.DeadlineDate)
            {
                errors.Add("Дедлайн задачи не может быть раньше ее даты публикации");
            }

            if (task.HasDeadline == false && task.IsDeadlineStrict == true)
            {
                errors.Add("Дедлайн не может быть строгим, если нет дедлайна");
            }

            if (task.HasDeadline is null && task.IsDeadlineStrict == true && homework.HasDeadline == false)
            {
                errors.Add(
                    "Дедлайн не может быть строгим, если задача не переопределяет HasDeadline и в домашнем задании нет дедлайна");
            }

            if (task.DeadlineDate is null && task.PublicationDate is { } publicationDate &&
                publicationDate > homework.DeadlineDate)
            {
                errors.Add("Дедлайн задачи, который непереопределен от домашнего задания раньше чем дата публикации самой задачи");
            }

            return errors;
        }

        public static List<string> ValidateHomework(CreateHomeworkViewModel homework, Homework? previousState = null)
        {
            var errors = new List<string>();

            homework.Tasks.ForEach(task => errors.AddRange(ValidateTask(task, homework.ToHomework())));

            if (homework.HasDeadline == false && homework.DeadlineDate != null)
            {
                errors.Add("DeadlineDate не может принимать значения, если у домашнего задания нет дедлайна");
            }

            if (homework.DeadlineDate is { } hwDeadlineDate && hwDeadlineDate < homework.PublicationDate)
            {
                errors.Add("Дедлайн не может быть раньше даты публикации домашнего задания");
            }

            if (homework.HasDeadline && homework.DeadlineDate is null)
            {
                errors.Add("Если у домашнего задания есть дедлайн, то значение DeadlineDate не должно быть равно null");
            }

            if (!homework.HasDeadline && homework.IsDeadlineStrict)
            {
                errors.Add("Дедлайн не может быть строгим, если нет дедлайна");
            }

            if (previousState == null) return errors;

            if (previousState.Tasks.Any(t =>
                    t.PublicationDate != null && t.PublicationDate < homework.PublicationDate))
            {
                errors.Add("Дата публикации домашнего задания не может быть позже чем дата публикации задачи");
            }

            if (previousState.PublicationDate <= DateTime.UtcNow &&
                homework.PublicationDate != previousState.PublicationDate)
            {
                errors.Add("Нельзя изменить дату публикации домашнего задания, если она уже показана студента");
            }

            return errors;
        }
    }
}
