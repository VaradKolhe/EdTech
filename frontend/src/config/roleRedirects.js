export const ROLE_REDIRECT_PATHS = {
  student: "/student-dashboard",
  instructor: "/instructor-dashboard",
  admin: "/admin-dashboard",
};

export const getRoleRedirectPath = (role) => ROLE_REDIRECT_PATHS[role] ?? "/";

export const isStudentProfileComplete = (profile = {}) =>
  Boolean(
    profile.ageGroup &&
      profile.educationLevel &&
      Array.isArray(profile.preferredStreams) &&
      profile.preferredStreams.length > 0 &&
      profile.skillLevel &&
      profile.careerGoal &&
      profile.budgetPreference &&
      profile.preferredDifficulty &&
      profile.preferredLanguage
  );
