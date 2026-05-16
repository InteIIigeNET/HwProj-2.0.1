using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HwProj.CoursesService.API.Migrations
{
    public partial class CriterionArguments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Arguments",
                table: "Criteria",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Arguments",
                table: "Criteria");
        }
    }
}
