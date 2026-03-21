using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class RenameAndChangeTypeLtiToolId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LtiToolId",
                table: "Courses");

            migrationBuilder.AddColumn<string>(
                name: "LtiToolName",
                table: "Courses",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LtiToolName",
                table: "Courses");

            migrationBuilder.AddColumn<long>(
                name: "LtiToolId",
                table: "Courses",
                nullable: true);
        }
    }
}
