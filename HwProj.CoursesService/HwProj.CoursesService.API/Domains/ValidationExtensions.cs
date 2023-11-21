using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.WindowsAzure.Storage.Blob.Protocol;
using RabbitMQ.Client.Impl;

namespace HwProj.CoursesService.API.Domains
{
    public static class ValidationExtensions
    { 
        public static List<string> Validate(this CreateTaskViewModel task, Homework homework, HomeworkTask? previousState = null)
        {
            var errors = new List<string>();

            if (task.PublicationDate != null && task.PublicationDate < homework.PublicationDate)
            {
                errors.Add("Publication date of task cannot to be sooner than homework publication date");
            }

            if (previousState != null 
                && task.PublicationDate != null 
                && previousState.PublicationDate <= DateTimeUtils.GetMoscowNow() 
                && task.PublicationDate != previousState.PublicationDate)
            {
                errors.Add("It is not possible to change the publication date of a task if it has already been published to students.");
            }

            if ((!task.HasDeadline ?? true) && task.DeadlineDate != null)
            {
                errors.Add("DeadlineDate cannot to have a value if the task has no deadline or it is null.");
            }

            if (task.DeadlineDate != null && task.DeadlineDate < homework.PublicationDate)
            {
                errors.Add("Deadline date cannot to be earlier than publication date");
            }

            if ((task.HasDeadline ?? false) && task.DeadlineDate == null)
            {
                errors.Add("Task HasDeadline cannot to be true if deadline undefined.");
            }

            return errors;
        }

        public static List<string> Validate(this CreateHomeworkViewModel homework, Homework? previousState = null)
        {
            var errors = new List<string>();

            homework.Tasks.ForEach(task => errors.AddRange(task.Validate(homework.ToHomework())));

            if (previousState != null
                && previousState.Tasks.Any(t => t.PublicationDate != null 
                && t.PublicationDate < homework.PublicationDate))
            {
                errors.Add("Homework's publication date cannot to be earlier than already existing task publication date");
            }
            
            if (previousState != null
                && previousState.PublicationDate <= DateTimeUtils.GetMoscowNow()
                && homework.PublicationDate != previousState.PublicationDate)
            {
                errors.Add("It is not possible to change the publication date of a homework if it has already been published to students.");
            }

            if (homework is { HasDeadline: false, DeadlineDate: not null })
            {
                errors.Add("Deadline cannot to have value if homework doesn't have deadline.");
            }

            if (homework.DeadlineDate != null && homework.DeadlineDate < homework.PublicationDate)
            {
                errors.Add("Deadline date cannot to be sooner than publication date");
            }

            if (homework is { HasDeadline: true, DeadlineDate: null })
            {
                errors.Add("DeadlineDate doesn't have a value, but homework has a deadline.");
            }

            if ((!homework.HasDeadline || homework.DeadlineDate == null) && homework.IsDeadlineStrict)
            {
                errors.Add("The deadline cannot be strict if there is no deadline in the homework");
            }

            return errors;
        }
    }
}