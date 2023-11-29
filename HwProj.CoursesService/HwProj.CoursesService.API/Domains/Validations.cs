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

            if (task.HasDeadline == null && !homework.HasDeadline && task.DeadlineDate != null)
            {
                errors.Add(
                    "DeadlineDate не может принимать какое-либо значение, если задача не переопределяет HasDeadline и в домашнем задании нет дедлайна");
            }

            if (task is { HasDeadline: false, DeadlineDate: not null })
            {
                errors.Add("DeadlineDate не может принимать какое-либо значение, если у задачи нет дедлайна");
            }

            if (task is { HasDeadline: true, DeadlineDate: null } && !homework.HasDeadline)
            {
                errors.Add(
                    "HasDeadline не может принимать значение true, значение DeadlineDate не переопределено и при этом у домашнего задания нет дедлайна");
            }

            if (task.DeadlineDate != null && task.DeadlineDate < homework.PublicationDate)
            {
                errors.Add("Дедлайн не может быть раньше даты публикации задачи");
            }

            if (task is { HasDeadline: false, IsDeadlineStrict: true })
            {
                errors.Add("Дедлайн не может быть строгим, если нет дедлайна");
            }

            if (task is { HasDeadline: null, IsDeadlineStrict: true } && homework.HasDeadline == false)
            {
                errors.Add(
                    "Дедлайн не может быть строгим, если задача не переопределяет HasDeadline и в домашнем задании нет дедлайна");
            }

            return errors;
        }

        public static List<string> ValidateHomework(CreateHomeworkViewModel homework, Homework? previousState = null)
        {
            var errors = new List<string>();

            homework.Tasks.ForEach(task => errors.AddRange(ValidateTask(task, homework.ToHomework())));

            //TODO: rewrite in old C#-style
            if (homework is { HasDeadline: false, DeadlineDate: not null })
            {
                errors.Add("DeadlineDate не может принимать значения, если у домашнего задания нет дедлайна");
            }

            if (homework.DeadlineDate is { } hwDeadlineDate && hwDeadlineDate < homework.PublicationDate)
            {
                errors.Add("Дедлайн не может быть раньше даты публикации домашнего задания");
            }

            if (homework is { HasDeadline: true, DeadlineDate: null })
            {
                errors.Add("Если у домашнего задания есть дедлайн, то значение DeadlineDate не должно быть равно null");
            }

            if (homework is { HasDeadline: false, IsDeadlineStrict: true })
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
