/**
 * Post-auth redirect paths — consumed by dashboard branches on merge.
 * Update here only; do not hardcode paths in auth pages.
 */
export const ROLE_REDIRECT_PATHS = {
  student: "/student-dashboard",
  teacher: "/teacher-dashboard",
  admin: "/admin-dashboard",
};

export const getRoleRedirectPath = (role) =>
  ROLE_REDIRECT_PATHS[role] ?? "/";
