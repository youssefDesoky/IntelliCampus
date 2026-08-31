namespace IntelliCampus.Shared.Dtos.Bylaw;

public class DepartmentValidationDetailDto
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = null!;
    public string? DepartmentNameAr { get; set; }
    public int CalculatedTotalHours { get; set; }
    public int RequiredHours { get; set; }
    public bool IsValid => CalculatedTotalHours >= RequiredHours;
}
