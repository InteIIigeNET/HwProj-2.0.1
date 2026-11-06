using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HwProj.NotificationsService.API.Migrations
{
    /// <inheritdoc />
    public partial class NotificationDigest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DigestData",
                table: "Notifications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DigestKind",
                table: "Notifications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDigestOnly",
                table: "Notifications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_Date",
                table: "Notifications",
                column: "Date",
                filter: "[DigestKind] IS NOT NULL")
                .Annotation("SqlServer:Include", new[] { "Owner" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notifications_Date",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "DigestData",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "DigestKind",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "IsDigestOnly",
                table: "Notifications");
        }
    }
}
