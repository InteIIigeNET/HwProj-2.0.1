namespace HwProj.Models.StatisticsService;

public class DetailedCourseStatsModel
{
    public long TaskId { get; set; }

    public long NumberSolutionsRatePosted { get; set; }

    public long NumberSolutionsRateFinal { get; set; }

    public double AverageTimeHandIn { get; set; }

    public double MinimumTimeHandIn { get; set; }

    public double AverageScoreOnFirstAttempt { get; set; }

    public double AverageFinalGrade { get; set; }

    public double AverageNumberOfCorrections { get; set; }
}
