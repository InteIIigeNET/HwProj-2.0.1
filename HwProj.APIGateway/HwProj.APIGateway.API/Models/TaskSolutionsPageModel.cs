using HwProj.APIGateway.API.Models.Solutions;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.APIGateway.API.Models
{
    public class TaskSolutionsPageModel
    {
        public UserTaskSolutions[] StudentsTaskSolutions { get; set; }
        public HomeworkTaskViewModel Task { get; set; }
        public CoursePreview Course { get; set; }
    }
}
