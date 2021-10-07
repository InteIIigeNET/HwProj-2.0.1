namespace ConfigurableAssessmentSystem
{
    public interface IAssessmentSystem
    {
        int CalculateAssessmentForTask(TaskModel task,
            SolutionModel[] solutions);
    }
}