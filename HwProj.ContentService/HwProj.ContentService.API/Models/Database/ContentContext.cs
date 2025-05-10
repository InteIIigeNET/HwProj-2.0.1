using Microsoft.EntityFrameworkCore;

namespace HwProj.ContentService.API.Models.Database;

public class ContentContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<FileRecord> FileRecords { get; set; }
    public DbSet<FileToCourseUnit> FileToCourseUnits { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FileRecord>()
            .HasIndex(fr => new { fr.Status });

        modelBuilder.Entity<FileToCourseUnit>()
            .HasKey(ftc => new { ftc.FileId, ftc.CourseUnitType, ftc.CourseUnitId });
        modelBuilder.Entity<FileToCourseUnit>()
            .HasIndex(ftc => new { ftc.FileId });
        modelBuilder.Entity<FileToCourseUnit>()
            .HasIndex(ftc => new { ftc.CourseId });
    }
}
