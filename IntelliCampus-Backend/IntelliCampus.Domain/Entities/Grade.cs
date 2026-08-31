using IntelliCampus.Domain.Entities.Enums;

namespace IntelliCampus.Domain.Entities;

public class Grade
{
    public int GradeId { get; set; }
    public int StudentId { get; set; }
    public int CourseId { get; set; }

    public string Title { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public decimal MaxScore { get; set; }
    public decimal Weight { get; set; }
    public GradeType GradeType { get; set; }
    public string? Notes { get; set; }
    public DateTime GradedAt { get; set; }
    public string Status { get; set; } = "Pending"; // Graded | Pending

    // Navigation
    public Student Student { get; set; } = null!;
    public Course Course { get; set; } = null!;
}
