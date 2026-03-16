using System.Collections.Generic;
using System.Linq;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API.Domains
{
    public static class SolutionsDomain
    {
        //TODO: rewrite
        public static StudentSolutionsTable[] GetCourseSolutionsTable(StudentsSolutionsTableContext model) =>
            model.CourseMates
                .Select(m =>
                {
                    var studentGroupIds = model.Groups
                        .Where(g => g.StudentsIds.Contains(m.StudentId))
                        .Select(g => g.Id)
                        .ToArray();

                    return new StudentSolutionsTable
                    {
                        StudentId = m.StudentId,
                        Homeworks = new List<StudentSolutionsTable.StudentSolutionsTableHomework>(model.Homeworks.Select(h =>
                            new StudentSolutionsTable.StudentSolutionsTableHomework
                            {
                                Id = h.Id,
                                Tasks = new List<StudentSolutionsTable.StudentSolutionsTableTask>(h.Tasks.Select(t =>
                                {
                                    var solutions =
                                        model.Solutions
                                            .Where(s =>
                                                s.TaskId == t.Id &&
                                                (s.StudentId == m.StudentId ||
                                                 studentGroupIds.Contains(s.GroupId.GetValueOrDefault())
                                                ))
                                            .OrderBy(s => s.PublicationDate);
                                    return new StudentSolutionsTable.StudentSolutionsTableTask
                                    {
                                        Id = t.Id,
                                        Solutions = solutions.ToList()
                                    };
                                }))
                            }))
                    };
                }).ToArray();

        public static StudentSolutions[] GetStudentsSolutions(List<Solution> solutions,
            IEnumerable<GroupViewModel> groups)
        {
            return solutions
                .GroupBy(t => t.GroupId)
                .SelectMany(t => t.Key == null
                    ? t.GroupBy(s => s.StudentId)
                        .Select(studentSolutionsWithoutGroup => new StudentSolutions()
                        {
                            StudentId = studentSolutionsWithoutGroup.Key,
                            Solutions = studentSolutionsWithoutGroup.ToArray()
                        })
                    : groups.FirstOrDefault(x => x.Id == t.Key) is { } group && t.ToArray() is { } groupSolutions
                        ? group.StudentsIds
                            .Select(studentId => new StudentSolutions()
                            {
                                StudentId = studentId,
                                Solutions = groupSolutions
                            })
                        : Enumerable.Empty<StudentSolutions>())
                .GroupBy(s => s.StudentId)
                .Select(g => new StudentSolutions
                {
                    StudentId = g.Key,
                    Solutions = g.SelectMany(s => s.Solutions)
                        .OrderBy(s => s.PublicationDate)
                        .ToArray()
                })
                .ToArray();
        }
    }

    public class StudentsSolutionsTableContext
    {
        public IEnumerable<CourseMateViewModel> CourseMates { get; set; }
        public List<HomeworkViewModel> Homeworks { get; set; }
        public List<Solution> Solutions { get; set; }
        public GroupViewModel[] Groups { get; set; }
    }

    public class StudentSolutionsTable
    {
        public string StudentId { get; set; }
        public List<StudentSolutionsTableHomework> Homeworks { get; set; }

        public class StudentSolutionsTableHomework
        {
            public long Id { get; set; }
            public List<StudentSolutionsTableTask> Tasks { get; set; } = new List<StudentSolutionsTableTask>();
        }
        public class StudentSolutionsTableTask
        {
            public long Id { get; set; }
            public List<Solution> Solutions { get; set; } = new List<Solution>();
        }
    }

    public class StudentSolutions
    {
        public string StudentId { get; set; }
        public Solution[] Solutions { get; set; }
    }
}
