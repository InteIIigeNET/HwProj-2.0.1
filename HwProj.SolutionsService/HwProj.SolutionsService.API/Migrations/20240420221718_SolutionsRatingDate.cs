using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace HwProj.SolutionsService.API.Migrations
{
    public partial class SolutionsRatingDate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "RatingDate",
                table: "Solutions",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RatingDate",
                table: "Solutions");
        }
    }
}
