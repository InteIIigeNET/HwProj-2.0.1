using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.API.Domains;
using HwProj.SolutionsService.API.Models;
using NUnit.Framework;

namespace HwProj.SolutionsService.IntegrationTests
{
    [TestFixture]
    public class SolutionsStatsDomainTests
    {
        private IEnumerable<string> GenerateUserIds(int amount)
        {
            return Enumerable.Repeat(0, amount).Select(_ => Guid.NewGuid().ToString());
        }

        private IEnumerable<CourseMateViewModel> GenerateCourseMatesViewModels(int amount)
        {
            var userIds = GenerateUserIds(amount);
            return userIds.Select(s => new CourseMateViewModel
            {
                StudentId = s,
                IsAccepted = true
            });
        }

        private List<HomeworkTaskViewModel> GenerateHomeworkTaskViewModels(int amount, long homeworkId) => Enumerable
            .Range(1, amount)
            .Select(i => new HomeworkTaskViewModel
            {
                Id = i,
                Title = $"Task {i}",
                Description = $"Task {i} description",
                DeadlineDate = null,
                HasDeadline = false,
                HomeworkId = homeworkId,
                IsDeadlineStrict = false,
                IsDeferred = false,
                MaxRating = 10,
                PublicationDate = DateTime.Now
            })
            .ToList();

        private List<Solution> GenerateTestSolutionsForTask(int amount, long taskId) => Enumerable
            .Range(1, amount)
            .Select(i => new Solution
            {
                Id = i,
                TaskId = taskId,
                Rating = 5,
                Comment = $"Solution ${i}",
                State = SolutionState.Rated
            })
            .ToList();

        private GroupViewModel GenerateGroupViewModel(long id, string[] studentIds) => new()
        {
            Id = id,
            StudentsIds = studentIds
        };

        private HomeworkViewModel GenerateHomeworkViewModel(long id, long courseId, int taskAmount) => new()
        {
            Id = id,
            Title = "Test",
            Description = "Test description",
            Date = DateTime.Now,
            CourseId = courseId,
            Tasks = GenerateHomeworkTaskViewModels(taskAmount, id)
        };

        private List<Solution> MakeTestSolutions(CourseMateViewModel[] courseMates, GroupViewModel[] groups)
        {
            var solutions = GenerateTestSolutionsForTask(3, 1);
            solutions[0].StudentId = courseMates[0].StudentId;
            solutions[1].StudentId = courseMates[1].StudentId;
            solutions[2].StudentId = courseMates[1].StudentId;
            solutions[0].GroupId = groups[0].Id;
            solutions[1].GroupId = groups[1].Id;
            
            return solutions;
        }

        [Test]
        public async Task GetCourseStatisticsTest()
        {
            var courseMates = GenerateCourseMatesViewModels(3).ToArray();
            var homework = GenerateHomeworkViewModel(1, 1, 1);

            var group1 = GenerateGroupViewModel(1, courseMates.Select(s => s.StudentId).ToArray());
            var group2 = GenerateGroupViewModel(2, new[] { courseMates[0].StudentId, courseMates[1].StudentId });
            var groups = new[] { group1, group2 };

            var solutions = MakeTestSolutions(courseMates, groups);

            var solutionsStatsContext = new StatisticsAggregateModel
            {
                CourseMates = courseMates,
                Homeworks = new List<HomeworkViewModel>(new[] { homework }),
                Solutions = solutions,
                Groups = groups
            };

            var result = SolutionsStatsDomain.GetCourseStatistics(solutionsStatsContext);
            var firstStudentSolutions = result
                .First(t => t.StudentId == courseMates[0].StudentId).Homeworks
                .SelectMany(s => s.Tasks).SelectMany(t => t.Solution).ToArray();
            var secondStudentSolutions = result
                .First(t => t.StudentId == courseMates[1].StudentId).Homeworks
                .SelectMany(s => s.Tasks).SelectMany(t => t.Solution).ToArray();
            var thirdStudentSolutions = result
                .First(t => t.StudentId == courseMates[2].StudentId).Homeworks
                .SelectMany(s => s.Tasks).SelectMany(t => t.Solution).ToArray();

            firstStudentSolutions.Should().HaveCount(2);
            firstStudentSolutions[0].Id.Should().Be(1);
            firstStudentSolutions[1].Id.Should().Be(2);
            secondStudentSolutions.Should().HaveCount(3);
            secondStudentSolutions[0].Id.Should().Be(1);
            secondStudentSolutions[1].Id.Should().Be(2);
            secondStudentSolutions[2].Id.Should().Be(3);
            thirdStudentSolutions.Should().HaveCount(1);
            thirdStudentSolutions[0].Id.Should().Be(1);
        }
        
        [Test]
        public async Task GetCourseTaskStatisticsTest()
        {
            var courseMates = GenerateCourseMatesViewModels(3).ToArray();
            var group1 = GenerateGroupViewModel(1, new[] { courseMates[0].StudentId, courseMates[1].StudentId });
            var group2 = GenerateGroupViewModel(2, new[] { courseMates[1].StudentId, courseMates[2].StudentId });
            var groups = new[] { group1, group2 };
            
            var solutions = GenerateTestSolutionsForTask(3, 1);
            solutions[0].StudentId = courseMates[0].StudentId;
            solutions[0].GroupId = group1.Id;
            solutions[1].StudentId = courseMates[1].StudentId;
            solutions[2].StudentId = courseMates[1].StudentId;
            solutions[2].GroupId = group2.Id;

            var result = SolutionsStatsDomain.GetCourseTaskStatistics(solutions, groups);
            var firstStudentSolutions = result.First(t => t.StudentId == courseMates[0].StudentId)
                .Solutions.ToArray();
            var secondStudentSolutions = result.First(t => t.StudentId == courseMates[1].StudentId)
                .Solutions.ToArray();
            var thirdStudentSolutions = result.First(t => t.StudentId == courseMates[2].StudentId)
                .Solutions.ToArray();

            firstStudentSolutions.Should().HaveCount(1);
            firstStudentSolutions[0].Id.Should().Be(1);
            secondStudentSolutions.Should().HaveCount(3);
            secondStudentSolutions[0].Id.Should().Be(1);
            secondStudentSolutions[1].Id.Should().Be(2);
            secondStudentSolutions[2].Id.Should().Be(3);
            thirdStudentSolutions.Should().HaveCount(1);
            thirdStudentSolutions[0].Id.Should().Be(3);
        }
    }
}