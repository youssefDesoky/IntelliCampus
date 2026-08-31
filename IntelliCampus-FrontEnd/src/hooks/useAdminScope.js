import { useRouteLoaderData } from "react-router-dom";

const ROLE_TO_STUDENT_TYPE = {
  superadmin: null,
  admin_bachelor: 'Bachelor',
  admin_masters: 'Masters',
  admin_phd: 'PhD',
  admin_diploma: 'Diploma',
};

export default function useAdminScope() {
  const user = useRouteLoaderData("root");
  const roles = (user?.roles || []).map(r => r.toLowerCase());

  const isSuperAdmin = roles.some(r => r === 'superadmin');
  const typedAdminRole = roles.find(r => ROLE_TO_STUDENT_TYPE[r] !== undefined && r !== 'superadmin');
  const defaultStudentType = ROLE_TO_STUDENT_TYPE[typedAdminRole] ?? null;

  const studentType = defaultStudentType;
  const canSwitchStudentType = isSuperAdmin;

  return { studentType, canSwitchStudentType, defaultStudentType, isSuperAdmin };
}
