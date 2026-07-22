"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { safeLocalStorage } from "@/utils/storage";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = safeLocalStorage.getItem("theme");
    if (stored) {
      setIsDark(stored === "dark");
    } else if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    safeLocalStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark, mounted]);

  const toggle = () => setIsDark((v) => !v);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle dark mode"
        className="inline-flex h-9 w-[72px] shrink-0 items-center rounded-full border-2 border-border bg-muted"
      />
    );
  }

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={toggle}
      className="relative inline-flex h-9 w-[72px] shrink-0 cursor-pointer items-center rounded-full border-2 border-border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2.5">
        <Sun
          weight="duotone"
          className={cn(
            "size-3.5 transition-opacity duration-300",
            isDark ? "text-muted-foreground/50 opacity-100" : "opacity-0",
          )}
        />
        <Moon
          weight="duotone"
          className={cn(
            "size-3.5 transition-opacity duration-300",
            isDark ? "opacity-0" : "text-muted-foreground/50 opacity-100",
          )}
        />
      </span>

      <span
        className={cn(
          "pointer-events-none relative z-10 size-7 rounded-full bg-foreground shadow-sm transition-transform duration-300 ease-in-out",
          isDark ? "translate-x-[38px]" : "translate-x-1",
        )}
      >
        <span className="absolute inset-0 flex items-center justify-center">
          <Sun
            weight="duotone"
            className={cn(
              "size-3.5 text-background transition-all duration-300",
              isDark
                ? "rotate-90 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100",
            )}
          />
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <Moon
            weight="duotone"
            className={cn(
              "size-3.5 text-background transition-all duration-300",
              isDark
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0",
            )}
          />
        </span>
      </span>
    </button>
  );
}

export default ThemeToggle;
