using HwProj.EventBus.Client;

namespace HwProj.Models.CoursesService.Events;

public class LecturerRejectToCourseEvent : Event
{
    public long CourseId { get; set; }
    public string CourseName { get; set; }
    public string MentorIds { get; set; }
    public string StudentId { get; set; }
}