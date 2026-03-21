using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class AddIsBonusExplicitColumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskLtiUrls_Tasks_TaskId",
                table: "TaskLtiUrls");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TaskLtiUrls",
                table: "TaskLtiUrls");

            migrationBuilder.RenameTable(
                name: "TaskLtiUrls",
                newName: "TaskLtiData");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TaskLtiData",
                table: "TaskLtiData",
                column: "TaskId");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskLtiData_Tasks_TaskId",
                table: "TaskLtiData",
                column: "TaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskLtiData_Tasks_TaskId",
                table: "TaskLtiData");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TaskLtiData",
                table: "TaskLtiData");

            migrationBuilder.RenameTable(
                name: "TaskLtiData",
                newName: "TaskLtiUrls");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TaskLtiUrls",
                table: "TaskLtiUrls",
                column: "TaskId");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskLtiUrls_Tasks_TaskId",
                table: "TaskLtiUrls",
                column: "TaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
