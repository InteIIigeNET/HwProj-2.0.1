using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class CreateCourseFilterTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CourseFilters",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    FilterJson = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseFilters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserToCourseFilters",
                columns: table => new
                {
                    CourseId = table.Column<long>(nullable: false),
                    UserId = table.Column<string>(nullable: false),
                    CourseFilterId = table.Column<long>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserToCourseFilters", x => new { x.CourseId, x.UserId });
                    table.ForeignKey(
                        name: "FK_UserToCourseFilters_CourseFilters_CourseFilterId",
                        column: x => x.CourseFilterId,
                        principalTable: "CourseFilters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserToCourseFilters_CourseFilterId",
                table: "UserToCourseFilters",
                column: "CourseFilterId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserToCourseFilters");

            migrationBuilder.DropTable(
                name: "CourseFilters");
        }
    }
}
