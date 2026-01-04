using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class AddHomeworkTaskLtiUrlTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TaskLtiUrls",
                columns: table => new
                {
                    TaskId = table.Column<long>(nullable: false),
                    LtiLaunchUrl = table.Column<string>(nullable: false),
                    ToolId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskLtiUrls", x => x.TaskId);
                    table.ForeignKey(
                        name: "FK_TaskLtiUrls_Tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TaskLtiUrls");
        }
    }
}
