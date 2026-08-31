using IntelliCampus.Domain.Entities;

namespace IntelliCampus.Service.Specifications;

internal sealed class DepartmentByFacultySpec : BaseSpecifications<Department>
{
    public DepartmentByFacultySpec(int? facultyId)
        : base(d => d.FacultyId == facultyId)
    {
    }
}
