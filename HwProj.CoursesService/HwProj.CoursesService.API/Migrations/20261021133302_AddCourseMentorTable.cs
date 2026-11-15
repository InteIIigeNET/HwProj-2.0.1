using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HwProj.CoursesService.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseMentorTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CourseMentors",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CourseId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseMentors", x => new { x.UserId, x.CourseId });
                    table.ForeignKey(
                        name: "FK_CourseMentors_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
            
            migrationBuilder.CreateIndex(
                name: "IX_CourseMentors_CourseId",
                table: "CourseMentors",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseMentors_UserId",
                table: "CourseMentors",
                column: "UserId");
            
            migrationBuilder.Sql(@"
                INSERT INTO CourseMentors (UserId, CourseId)
                SELECT LTRIM(RTRIM(value)), c.Id
                FROM Courses c
                CROSS APPLY STRING_SPLIT(c.MentorIds, '/')
                WHERE c.MentorIds IS NOT NULL 
                  AND c.MentorIds != ''
                  AND LTRIM(RTRIM(value)) != ''
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourseMentors");
        }
    }
}
