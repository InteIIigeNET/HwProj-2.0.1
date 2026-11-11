-- Локальная база EnsureCreated: изменения схемы из upstream NotificationDigest.
-- Для баз с историей миграций следует применять штатную EF-миграцию.
USE [NotificationsServiceDB];
GO
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NOT NULL
    THROW 50000, 'Use EF migrations for databases with migration history.', 1;
IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
    THROW 50000, 'Notifications table not found.', 1;
IF COL_LENGTH(N'dbo.Notifications', N'DigestData') IS NULL
    ALTER TABLE dbo.Notifications ADD DigestData nvarchar(max) NULL;
IF COL_LENGTH(N'dbo.Notifications', N'DigestKind') IS NULL
    ALTER TABLE dbo.Notifications ADD DigestKind int NULL;
IF COL_LENGTH(N'dbo.Notifications', N'IsDigestOnly') IS NULL
    ALTER TABLE dbo.Notifications ADD IsDigestOnly bit NOT NULL
        CONSTRAINT DF_Notifications_IsDigestOnly DEFAULT (0) WITH VALUES;
IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE object_id = OBJECT_ID(N'dbo.Notifications') AND name = N'IX_Notifications_Date')
    EXEC(N'CREATE INDEX IX_Notifications_Date ON dbo.Notifications ([Date]) INCLUDE ([Owner])
           WHERE DigestKind IS NOT NULL');
COMMIT TRANSACTION;
