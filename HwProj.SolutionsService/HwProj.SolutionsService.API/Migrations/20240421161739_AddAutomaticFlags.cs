using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.SolutionsService.API.Migrations
{
    public partial class AddAutomaticFlags : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAutomatic",
                table: "Solutions",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsUpdated",
                table: "Solutions",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAutomatic",
                table: "Solutions");

            migrationBuilder.DropColumn(
                name: "IsUpdated",
                table: "Solutions");
        }
    }
}
