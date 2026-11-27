using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.SolutionsService.API.Migrations
{
    public partial class SolutionRequiresRevision : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RequiresRevision",
                table: "Solutions",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RequiresRevision",
                table: "Solutions");
        }
    }
}
