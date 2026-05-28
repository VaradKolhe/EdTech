import { createContext, useContext, useState, useEffect } from "react";
import i18n from "../i18n";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    return stored ? stored === "dark" : true;
  });

  const [appLanguage, setAppLanguage] = useState(() => {
    return localStorage.getItem("appLanguage") || localStorage.getItem("language") || i18n.language || "en";
  });

  const [courseContentLanguage, setCourseContentLanguage] = useState(() => {
    return localStorage.getItem("courseContentLanguage") || "same";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("appLanguage", appLanguage);
    localStorage.setItem("language", appLanguage);
    i18n.changeLanguage(appLanguage);
  }, [appLanguage]);

  useEffect(() => {
    localStorage.setItem("courseContentLanguage", courseContentLanguage);
  }, [courseContentLanguage]);

  const effectiveCourseContentLanguage =
    courseContentLanguage === "same" ? appLanguage : courseContentLanguage;

  return (
    <ThemeContext.Provider value={{ 
      dark, 
      toggle: () => setDark((d) => !d),
      appLanguage,
      setAppLanguage,
      globalLanguage: appLanguage,
      setGlobalLanguage: setAppLanguage,
      language: appLanguage,
      setLanguage: setAppLanguage,
      courseContentLanguage,
      setCourseContentLanguage,
      effectiveCourseContentLanguage,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
