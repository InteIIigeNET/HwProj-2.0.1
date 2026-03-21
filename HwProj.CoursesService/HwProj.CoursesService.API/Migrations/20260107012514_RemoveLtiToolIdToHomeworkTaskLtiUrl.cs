using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class RemoveLtiToolIdToHomeworkTaskLtiUrl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ToolId",
                table: "TaskLtiUrls");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ToolId",
                table: "TaskLtiUrls",
                nullable: false,
                defaultValue: 0);
        }
    }
}
