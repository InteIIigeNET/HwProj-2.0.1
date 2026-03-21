using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class AddCustomParamsToLti : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomParams",
                table: "TaskLtiUrls",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomParams",
                table: "TaskLtiUrls");
        }
    }
}
