using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.SolutionsService.API.Migrations
{
    public partial class GithubCommits : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LastGithubSolutionCommits",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false),
                    CommitHash = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LastGithubSolutionCommits", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LastGithubSolutionCommits");
        }
    }
}
