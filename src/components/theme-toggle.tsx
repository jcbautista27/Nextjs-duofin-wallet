"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { useMounted } from "@/lib/use-mounted";

const OPTIONS = [
  { value: "system", label: "Sistema", Icon: MonitorIcon },
  { value: "light", label: "Claro", Icon: SunIcon },
  { value: "dark", label: "Oscuro", Icon: MoonIcon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) return null;

  const active = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[0];

  return (
    <div className="relative" title="Tema">
      <select
        aria-label="Cambiar tema"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="text-muted-foreground hover:text-foreground h-8 cursor-pointer appearance-none rounded-md border-transparent bg-transparent pl-7 pr-1 text-sm outline-none"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <active.Icon
        className="pointer-events-none absolute left-1.5 top-1/2 size-4 -translate-y-1/2"
        aria-hidden={true}
      />
    </div>
  );
}
