namespace IntelliCampus.Shared.Dtos.Bylaw;

public class CourseMappingValidationResultDto
{
    public bool IsValid { get; set; }
    public int? TotalHoursToCompleteDegree { get; set; }
    public List<DepartmentValidationDetailDto> DepartmentDetails { get; set; } = new();
}
