"use client";

import { Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { useTheme } from "@/lib/theme";
import { useDictionary } from "@/lib/i18n";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dict = useDictionary();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all duration-150 hover:bg-gray-50 hover:text-gray-900 hover:scale-105 active:scale-95 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      aria-label={isDark ? dict.common.switchToLight : dict.common.switchToDark}
      title={isDark ? dict.common.lightTheme : dict.common.darkTheme}
    >
      <span className="animate-icon-pop" key={theme}>
        {isDark ? <Sun size={17} weight="bold" /> : <Moon size={17} weight="bold" />}
      </span>
    </button>
  );
}
