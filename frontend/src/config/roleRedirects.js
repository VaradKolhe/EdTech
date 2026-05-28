export const ROLE_REDIRECT_PATHS = {
  student: "/student-dashboard",
  instructor: "/instructor-dashboard",
  admin: "/admin-dashboard",
};

export const getRoleRedirectPath = (user) => {
  if (!user) return "/";
  if (user.role === "student" && !isStudentProfileComplete(user.profile)) {
    return "/student-onboarding";
  }
  return ROLE_REDIRECT_PATHS[user.role] ?? "/";
};

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
