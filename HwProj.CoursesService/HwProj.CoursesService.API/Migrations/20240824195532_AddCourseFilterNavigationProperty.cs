using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class AddCourseFilterNavigationProperty : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_UserToCourseFilters_CourseFilterId",
                table: "UserToCourseFilters",
                column: "CourseFilterId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserToCourseFilters_CourseFilters_CourseFilterId",
                table: "UserToCourseFilters",
                column: "CourseFilterId",
                principalTable: "CourseFilters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserToCourseFilters_CourseFilters_CourseFilterId",
                table: "UserToCourseFilters");

            migrationBuilder.DropIndex(
                name: "IX_UserToCourseFilters_CourseFilterId",
                table: "UserToCourseFilters");
        }
    }
}
