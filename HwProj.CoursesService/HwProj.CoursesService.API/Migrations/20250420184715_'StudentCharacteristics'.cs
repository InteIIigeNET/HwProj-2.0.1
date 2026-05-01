using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class StudentCharacteristics : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StudentCharacteristics",
                columns: table => new
                {
                    CourseMateId = table.Column<long>(nullable: false),
                    Tags = table.Column<string>(nullable: true),
                    Description = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentCharacteristics", x => x.CourseMateId);
                    table.ForeignKey(
                        name: "FK_StudentCharacteristics_CourseMates_CourseMateId",
                        column: x => x.CourseMateId,
                        principalTable: "CourseMates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StudentCharacteristics");
        }
    }
}
