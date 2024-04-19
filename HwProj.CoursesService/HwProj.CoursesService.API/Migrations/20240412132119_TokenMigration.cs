using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using HwProj.CoursesService.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using CourseContext = HwProj.CoursesService.API.Models.CourseContext;

namespace HwProj.CoursesService.API.Migrations
{
    public partial class TokenMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Token",
                table: "Courses",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Token",
                table: "Courses");
        }
    }
}
