-- Только локальная база EnsureCreated без истории EF-миграций.
USE [CoursesServiceDB];
GO
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NOT NULL
    THROW 50000, 'Use EF migrations for databases with migration history.', 1;
IF OBJECT_ID(N'dbo.Homeworks', N'U') IS NULL
    THROW 50000, 'Homeworks table not found.', 1;
IF COL_LENGTH(N'dbo.Homeworks', N'HideRatings') IS NULL
    ALTER TABLE dbo.Homeworks ADD HideRatings bit NOT NULL
        CONSTRAINT DF_Homeworks_HideRatings DEFAULT (0) WITH VALUES;
COMMIT TRANSACTION;
