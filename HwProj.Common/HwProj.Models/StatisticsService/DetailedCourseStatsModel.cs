namespace HwProj.Models.StatisticsService;

public class DetailedCourseStatsModel
{
    public long TaskId { get; set; }

    public long NumberSolutionsRatePosted { get; set; }

    public long NumberSolutionsRateFinal { get; set; }

    public long AverageTimeHandIn { get; set; }

    public long MinimumTimeHandIn { get; set; }

    public long AverageScoreOnFirstAttempt { get; set; }

    public long AverageFinalGrade { get; set; }

    public long AverageNumberOfCorrections { get; set; }
}
