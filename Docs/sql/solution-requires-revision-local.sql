-- Только для локальной SolutionsServiceDB, созданной через EnsureCreated
-- без таблицы __EFMigrationsHistory. Для баз с историей применяйте EF-миграцию.
USE [SolutionsServiceDB];
GO

SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.Solutions', N'U') IS NULL
    THROW 50000, 'Solutions table not found. Check the target database.', 1;

IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NOT NULL
    THROW 50000, 'Use EF migrations for databases with migration history.', 1;

IF COL_LENGTH(N'dbo.Solutions', N'RequiresRevision') IS NULL
BEGIN
    ALTER TABLE [dbo].[Solutions]
        ADD [RequiresRevision] bit NOT NULL
            CONSTRAINT [DF_Solutions_RequiresRevision] DEFAULT (0) WITH VALUES;
END;

COMMIT TRANSACTION;
