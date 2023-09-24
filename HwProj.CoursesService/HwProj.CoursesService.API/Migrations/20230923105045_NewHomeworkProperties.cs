using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class NewHomeworkProperties : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Date",
                table: "Homeworks",
                newName: "PublicationDate");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeadlineDate",
                table: "Homeworks",
                nullable: true,
                defaultValue: null);

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

            migrationBuilder.Sql(
                "UPDATE Homeworks SET PublicationDate = (SELECT MIN (Tasks.PublicationDate) FROM Tasks WHERE Tasks.HomeworkId = Homeworks.Id) " +
                "UPDATE Homeworks SET DeadlineDate = (SELECT MAX (Tasks.DeadlineDate) FROM Tasks WHERE Tasks.HomeworkId = Homeworks.Id) " +
                "UPDATE Homeworks SET HasDeadline = 1 WHERE DeadlineDate IS NOT NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeadlineDate",
                table: "Homeworks");

            migrationBuilder.DropColumn(
                name: "HasDeadline",
                table: "Homeworks");

            migrationBuilder.DropColumn(
                name: "IsDeadlineStrict",
                table: "Homeworks");

            migrationBuilder.RenameColumn(
                name: "PublicationDate",
                table: "Homeworks",
                newName: "Date");
        }
    }
}
