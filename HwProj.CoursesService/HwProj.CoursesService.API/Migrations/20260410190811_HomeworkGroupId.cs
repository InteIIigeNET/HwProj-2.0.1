using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HwProj.CoursesService.API.Migrations
{
    /// <inheritdoc />
    public partial class HomeworkGroupId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "GroupId",
                table: "Homeworks",
                type: "bigint",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GroupId",
                table: "Homeworks");
        }
    }
}
