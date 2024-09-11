using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.AuthService.API.Migrations
{
    public partial class AddExpertDataTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExpertsData",
                columns: table => new
                {
                    Id = table.Column<string>(maxLength: 450, nullable: false),
                    IsProfileEdited = table.Column<bool>(nullable: false),
                    LecturerId = table.Column<string>(maxLength: 450, nullable: false),
                    Tags = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExpertsData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExpertsData_AspNetUsers_Id",
                        column: x => x.Id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExpertsData_Lecturers_Users_UserId",
                        column: x => x.LecturerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExpertsData");
        }
    }
}
