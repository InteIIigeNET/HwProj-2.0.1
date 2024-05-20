using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.AuthService.API.Migrations
{
    public partial class AddIsProfileEditedToExpertsTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsProfileEdited",
                table: "ExpertsData",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsProfileEdited",
                table: "ExpertsData");
        }
    }
}
