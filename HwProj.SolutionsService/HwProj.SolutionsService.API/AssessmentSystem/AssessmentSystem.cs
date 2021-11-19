using System;
using System.Linq;
using System.Reflection;
using ConfigurableAssessmentSystem;

namespace HwProj.SolutionsService.API.AssessmentSystem
{
    public static class AssessmentSystem
    {
        public static string PathForAssessmentDlls { get; } = "dllsForAssessment/dllForCourse";
        
        public static Func<AssessmentModel[], int> GetAssessmentMethodForCourse(long courseId)
        {
            var path = PathForAssessmentDlls + courseId + ".dll";
            var loadBuild = Assembly.LoadFrom(path);
            var classType = loadBuild.ExportedTypes.FirstOrDefault(t =>
                t.IsClass && typeof(IAssessmentSystem).GetTypeInfo().IsAssignableFrom(t.GetTypeInfo()));
            if (classType == null)
            {
                return null;
            }
            var assessmentClass = (IAssessmentSystem)Activator.CreateInstance(classType);
            return assessmentClass.CalculateAssessmentForCourse;
        }
    }
}