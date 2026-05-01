using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class HomeworkCommonProperties : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
    }
}
