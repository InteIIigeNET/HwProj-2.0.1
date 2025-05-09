using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class CourseMentors : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CourseMentors",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    CourseId = table.Column<long>(nullable: false)
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

            // Миграция данных: Перенос MentorIds в таблицу CourseMentor
            // language=SQL
            migrationBuilder.Sql(@"
-- Разделим MentorIds на элементы, преобразуем в строки, удалим дубликаты и вставим в таблицу CourseMentor
WITH SplitMentorIds AS (
    SELECT
        c.Id AS CourseId,
        LTRIM(RTRIM(value)) AS MentorId
    FROM Courses c
    CROSS APPLY STRING_SPLIT(c.MentorIds, '/') -- Разделяем MentorIds по запятой
)
, DistinctMentors AS (
    SELECT DISTINCT
        MentorId,
        CourseId
    FROM SplitMentorIds
    WHERE MentorId <> '' -- Исключаем пустые строки
)
INSERT INTO CourseMentors (UserId, CourseId)
SELECT
    MentorId,
    CourseId
FROM DistinctMentors;
");
        }
    }
}
