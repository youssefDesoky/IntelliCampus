using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntelliCampus.Presistence.Migrations
{
    /// <inheritdoc />
    public partial class DropGradeComplaintGradeFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GradeComplaints_Grades_GradeId",
                table: "GradeComplaints");

            migrationBuilder.DropIndex(
                name: "IX_GradeComplaints_GradeId",
                table: "GradeComplaints");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_GradeComplaints_GradeId",
                table: "GradeComplaints",
                column: "GradeId");

            migrationBuilder.AddForeignKey(
                name: "FK_GradeComplaints_Grades_GradeId",
                table: "GradeComplaints",
                column: "GradeId",
                principalTable: "Grades",
                principalColumn: "GradeId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
