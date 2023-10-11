using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Events
{
    public class UpdateTaskMaxRatingEvent : Event
    {
        public UpdateTaskMaxRatingEvent(string courseName, long courseId, string taskTitle, long taskId, string[] studentIds)
        {
            CourseName = courseName;
            CourseId = courseId;
            TaskTitle = taskTitle;
            TaskId = taskId;
            StudentIds = studentIds;
        }

        public string CourseName { get; set; }
        public long CourseId {get; set; }
        public string TaskTitle { get; set; }
        public long TaskId { get; set; }
        public string[] StudentIds { get; set; }
    }
}
