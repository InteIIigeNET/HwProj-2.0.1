namespace ConfigurableAssessmentSystem
{
    public interface IAssessmentSystem
    {
        int CalculateAssessmentForCourse(AssessmentModel[] assessmentModels);
        /* общая оценка за весь курс, 1 моделька */
        /* одна модель из полями таска и солюшина*/
    }
}