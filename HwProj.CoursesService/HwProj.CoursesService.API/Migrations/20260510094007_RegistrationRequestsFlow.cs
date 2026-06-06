using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HwProj.CoursesService.API.Migrations
{
    /// <inheritdoc />
    public partial class RegistrationRequestsFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RegistrationRequestDrafts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreferredLecturerEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CourseId = table.Column<long>(type: "bigint", nullable: true),
                    RequestedRole = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Surname = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MiddleName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ConfirmationToken = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsConfirmed = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrationRequestDrafts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RegistrationRequests",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreferredLecturerEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CourseId = table.Column<long>(type: "bigint", nullable: true),
                    RequestedRole = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Surname = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MiddleName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewedByUserId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RejectReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResolvedUserId = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrationRequests", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRequestDrafts_ConfirmationToken",
                table: "RegistrationRequestDrafts",
                column: "ConfirmationToken",
                unique: true,
                filter: "[ConfirmationToken] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRequestDrafts_Email",
                table: "RegistrationRequestDrafts",
                column: "Email",
                unique: true,
                filter: "[IsConfirmed] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRequests_CourseId_Status",
                table: "RegistrationRequests",
                columns: new[] { "CourseId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationRequests_Email",
                table: "RegistrationRequests",
                column: "Email",
                unique: true,
                filter: "[Status] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RegistrationRequestDrafts");

            migrationBuilder.DropTable(
                name: "RegistrationRequests");
        }
    }
}
