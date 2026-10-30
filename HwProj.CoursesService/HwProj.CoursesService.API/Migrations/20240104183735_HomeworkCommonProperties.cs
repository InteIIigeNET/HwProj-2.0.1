using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class HomeworkCommonProperties : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DECLARE @constraint NVARCHAR(200);
                SELECT @constraint = dc.name
                FROM sys.default_constraints dc
                JOIN sys.columns c ON dc.parent_column_id = c.column_id 
                    AND dc.parent_object_id = c.object_id
                WHERE c.object_id = OBJECT_ID('Homeworks') AND c.name = 'Date';
                
                IF @constraint IS NOT NULL
                    EXEC('ALTER TABLE Homeworks DROP CONSTRAINT ' + @constraint);
            ");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "Homeworks",
                newName: "PublicationDate");

            migrationBuilder.AlterColumn<DateTime>(
                name: "PublicationDate",
                table: "Tasks",
                nullable: true,
                oldClrType: typeof(DateTime));

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeadlineStrict",
                table: "Tasks",
                nullable: true,
                oldClrType: typeof(bool));

            migrationBuilder.AlterColumn<bool>(
                name: "HasDeadline",
                table: "Tasks",
                nullable: true,
                oldClrType: typeof(bool));

            migrationBuilder.AddColumn<DateTime>(
                name: "DeadlineDate",
                table: "Homeworks",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasDeadline",
                table: "Homeworks",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeadlineStrict",
                table: "Homeworks",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "IsDeadlineStrict", table: "Homeworks");
            migrationBuilder.DropColumn(name: "HasDeadline", table: "Homeworks");
            migrationBuilder.DropColumn(name: "DeadlineDate", table: "Homeworks");

            migrationBuilder.AlterColumn<bool>(
                name: "HasDeadline",
                table: "Tasks",
                nullable: false,
                oldClrType: typeof(bool),
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeadlineStrict",
                table: "Tasks",
                nullable: false,
                oldClrType: typeof(bool),
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "PublicationDate",
                table: "Tasks",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldNullable: true);

            migrationBuilder.RenameColumn(
                name: "PublicationDate",
                table: "Homeworks",
                newName: "Date");
        }
    }
}
