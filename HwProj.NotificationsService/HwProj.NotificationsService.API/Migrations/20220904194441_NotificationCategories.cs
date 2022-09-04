using System.Linq;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Models;
using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.NotificationsService.API.Migrations
{
    public partial class NotificationCategories : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Category",
                table: "Notifications",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: false);

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Category",
                keyValue: null,
                column: "Category",
                value: CategoryState.Profile);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
