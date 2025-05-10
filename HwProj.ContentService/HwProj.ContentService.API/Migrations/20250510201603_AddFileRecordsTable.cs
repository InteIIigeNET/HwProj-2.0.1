using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HwProj.ContentService.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFileRecordsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FileRecords",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Status = table.Column<int>(type: "int", nullable: false),
                    OriginalName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExternalKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SizeInBytes = table.Column<long>(type: "bigint", nullable: false),
                    ReferenceCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FileRecords", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FileRecords_Status",
                table: "FileRecords",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FileRecords");
        }
    }
}
