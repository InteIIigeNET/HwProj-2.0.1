using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class HomeworkHideRatings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(name: "HideRatings", table: "Homeworks",
                type: "bit", nullable: false, defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "HideRatings", table: "Homeworks");
        }
    }
}
