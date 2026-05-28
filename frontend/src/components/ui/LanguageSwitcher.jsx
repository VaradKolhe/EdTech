import { useTranslation } from "react-i18next";
import { LanguageIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../../context/ThemeContext";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
];

export default function LanguageSwitcher() {
  const { appLanguage, setAppLanguage } = useTheme();
  const { t } = useTranslation();

  return (
    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-[#161b22] dark:text-slate-300">
      <LanguageIcon className="h-4 w-4" />
      <span className="hidden xl:inline">Translate</span>
      <select
        value={appLanguage}
        onChange={(event) => setAppLanguage(event.target.value)}
        className="rounded-md bg-white text-xs font-black text-slate-900 outline-none dark:bg-[#161b22] dark:text-white"
        aria-label={t("language.website")}
      >
        {LANGUAGES.map((language) => (
          <option
            key={language.code}
            value={language.code}
            className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white"
          >
            {language.name}
          </option>
        ))}
      </select>
    </label>
  );
}
