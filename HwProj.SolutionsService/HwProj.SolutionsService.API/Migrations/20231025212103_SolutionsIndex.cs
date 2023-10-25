using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.SolutionsService.API.Migrations
{
    public partial class SolutionsIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Solutions_TaskId",
                table: "Solutions",
                column: "TaskId");
        }
    }
}
