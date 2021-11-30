using System;
using System.IO;
using System.Linq;
using System.Reflection;
using ConfigurableAssessmentSystem;
using Microsoft.AspNetCore.Http;

namespace HwProj.SolutionsService.API.AssessmentSystem
{
    public static class AssessmentSystem
    {
        public static string PathForAssessmentDlls { get; } = "dllsForAssessment/dllForCourse";
        
        public static Func<AssessmentModel[], int>? GetAssessmentMethodForCourse(long courseId)
        {
            var path = PathForAssessmentDlls + courseId + ".dll";
            if (!File.Exists(path))
            {
                return null;
            }
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

        public static bool CheckFileHaveAssessmentMethod(IFormFile file)
        {
            var fileInBytes = new byte[file.Length];
            using (var stream = file.OpenReadStream())
            {
                stream.Read(fileInBytes, 0, (int) file.Length);
            }
            var loadBuild = Assembly.Load(fileInBytes);
            return loadBuild.ExportedTypes.FirstOrDefault(t =>
                t.IsClass && typeof(IAssessmentSystem).GetTypeInfo().IsAssignableFrom(t.GetTypeInfo())) != null;
        }
    }
}