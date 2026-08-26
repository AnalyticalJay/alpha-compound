import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable || !toggleTheme) return null;

  const nextTheme = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === "dark"}
      title={`Switch to ${nextTheme} mode`}
      className={showLabel
        ? "theme-toggle flex min-h-11 w-full items-center gap-3 rounded px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#94A3B8] transition-colors hover:bg-white/5 hover:text-white"
        : "theme-toggle flex h-11 w-11 items-center justify-center rounded border border-[#1E293B] bg-transparent text-[#94A3B8] transition-colors hover:border-[#0EA5E9]/60 hover:bg-white/5 hover:text-white"}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {showLabel && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
