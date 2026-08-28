"use client";

type View = "mine" | "partner" | "combined";

interface ViewToggleProps {
  current: View;
  onChange: (view: View) => void;
  hasPartner: boolean;
}

export function ViewToggle({ current, onChange, hasPartner }: ViewToggleProps) {
  const options: { value: View; label: string }[] = [
    { value: "mine", label: "Mía" },
  ];
  if (hasPartner) {
    options.push(
      { value: "partner", label: "Pareja" },
      { value: "combined", label: "Combinada" }
    );
  }

  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={
            current === opt.value
              ? "rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              : "rounded-full px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
