using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class DeleteIsGroupWork : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE Homeworks SET Tags = Tags + ';Командная работа' WHERE IsGroupWork = 1 AND Tags != ''");
            migrationBuilder.Sql("UPDATE Homeworks SET Tags = 'Командная работа' WHERE IsGroupWork = 1 AND Tags = ''");
            
            migrationBuilder.DropColumn(
                name: "IsGroupWork",
                table: "Homeworks");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsGroupWork",
                table: "Homeworks",
                nullable: false,
                defaultValue: false);
        }
    }
}
