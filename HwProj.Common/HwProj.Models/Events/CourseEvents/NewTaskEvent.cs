using System;
using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.Models.Events.CourseEvents
{
    public class NewTaskEvent : Event
    {
        public long TaskId { get; set; }

        public HomeworkTaskDTO Task { get; set; }
        
        public CourseDTO Course { get; set; }


        public NewTaskEvent(long taskId, HomeworkTaskDTO task, CourseDTO course)
        {
            TaskId = taskId;
            Task = task;
            Course = course;
        }
    }
}