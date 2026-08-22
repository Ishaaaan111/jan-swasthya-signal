import { useState, useRef, useEffect } from "react";
import { useTheme, type Theme } from "@/lib/theme";
import { Sun, Moon, ChevronDown, Check } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Theme Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs hover:bg-accent hover:border-primary/40 transition-all cursor-pointer"
        aria-label="Select Theme"
      >
        {theme === "dark" ? (
          <Moon className="size-3.5 text-amber-400" />
        ) : (
          <Sun className="size-3.5 text-amber-500" />
        )}
        <span>Theme</span>
        <ChevronDown className="size-3 text-muted-foreground ml-0.5" />
      </button>

      {/* Dropdown Menu with Light and Dark Options */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 z-50 w-32 rounded-md border border-border bg-surface p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
          <button
            type="button"
            onClick={() => handleSelect("light")}
            className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
              theme === "light"
                ? "bg-primary/10 text-primary font-bold"
                : "text-foreground hover:bg-accent"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="size-3.5 text-amber-500" />
              <span>Light</span>
            </div>
            {theme === "light" && <Check className="size-3.5 text-primary" />}
          </button>

          <button
            type="button"
            onClick={() => handleSelect("dark")}
            className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
              theme === "dark"
                ? "bg-primary/10 text-primary font-bold"
                : "text-foreground hover:bg-accent"
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="size-3.5 text-amber-400" />
              <span>Dark</span>
            </div>
            {theme === "dark" && <Check className="size-3.5 text-primary" />}
          </button>
        </div>
      )}
    </div>
  );
}
