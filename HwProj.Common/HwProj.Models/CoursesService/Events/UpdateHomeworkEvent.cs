using HwProj.EventBus.Client;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.Models.CoursesService.Events;

public class UpdateHomeworkEvent : Event
{
    public HomeworkViewModel Homework { get; set; }
    public CourseDTO Course { get; set; }

    public UpdateHomeworkEvent(HomeworkViewModel homework, CourseDTO course)
    {
        Homework = homework;
        Course = course;
    }
}