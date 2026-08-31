import { Navigate, Outlet, useRouteLoaderData } from "react-router-dom";

const ROLE_GROUP_MAP = {
  student: ["student_bachelor", "student_masters", "student_phd", "student_diploma"],
  instructor: ["instructor"],
  admin: ["admin_bachelor", "admin_masters", "admin_phd", "admin_diploma", "admin_academicstaff", "superadmin"],
  superadmin: ["superadmin"],
};

function normalizeRoles(roles) {
  return (roles || []).flatMap(r => {
    const lower = r.toLowerCase();
    if (lower === "superadmin") return ["superadmin", "admin"];
    if (lower.startsWith("student_")) return [lower, "student"];
    if (lower === "instructor") return [lower, "instructor"];
    if (lower.startsWith("admin_")) return [lower, "admin"];
    return [lower];
  });
}

export default function RoleGuard({ allow }) {
  const user = useRouteLoaderData("root");
  const userRoles = normalizeRoles(user.roles || []);

  const expandedAllow = allow.flatMap(r => ROLE_GROUP_MAP[r] || [r]);

  const hasAccess = userRoles.some(r => expandedAllow.includes(r));

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
