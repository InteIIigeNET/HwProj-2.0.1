using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HwProj.CoursesService.API.Migrations
{
    /// <inheritdoc />
    public partial class DropMentorIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MentorIds",
                table: "Courses");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MentorIds",
                table: "Courses",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
