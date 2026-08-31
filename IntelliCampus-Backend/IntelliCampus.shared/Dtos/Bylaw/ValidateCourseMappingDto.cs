namespace IntelliCampus.Shared.Dtos.Bylaw;

public class ValidateCourseMappingDto
{
    public List<ValidationCourseDto> Courses { get; set; } = new();
    public List<ValidationElectiveBucketDto> ElectiveBuckets { get; set; } = new();
}
