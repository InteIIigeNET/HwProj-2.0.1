﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HwProj.ContentService.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFileToCourseUnitsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FileToCourseUnits",
                columns: table => new
                {
                    FileRecordId = table.Column<long>(type: "bigint", nullable: false),
                    CourseUnitId = table.Column<long>(type: "bigint", nullable: false),
                    CourseUnitType = table.Column<int>(type: "int", nullable: false),
                    CourseId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FileToCourseUnits", x => new { x.FileRecordId, x.CourseUnitType, x.CourseUnitId });
                    table.ForeignKey(
                        name: "FK_FileToCourseUnits_FileRecords_FileRecordId",
                        column: x => x.FileRecordId,
                        principalTable: "FileRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FileToCourseUnits_CourseId",
                table: "FileToCourseUnits",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_FileToCourseUnits_FileRecordId",
                table: "FileToCourseUnits",
                column: "FileRecordId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FileToCourseUnits");
        }
    }
}
