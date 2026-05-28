/**
 * Safely extracts the localized string from a multilingual object field.
 * 
 * @param {Object|string} field - The field containing the multilingual data (e.g., { en: "...", hi: "..." }) or a flat string.
 * @param {string} currentLang - The currently active language code (e.g., "en", "hi", "mr").
 * @param {string} fallback - A fallback string if no content is found.
 * @returns {string} The localized string.
 */
export const getLocalizedValue = (field, currentLang = "en", fallback = "") => {
  if (!field) return fallback;
  if (typeof field === "string") return field;
  
  const firstAvailable = Object.values(field).find((value) => typeof value === "string" && value.trim());
  const val = field[currentLang] || field.en || firstAvailable || fallback;
  return typeof val === "string" ? val : String(val || fallback);
};
