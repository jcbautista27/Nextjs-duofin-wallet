import { cn } from "@/lib/utils";

type PartnerColor = "jade" | "plum";

const colorClasses: Record<PartnerColor, string> = {
  jade: "bg-partner-jade-bg text-partner-jade",
  plum: "bg-partner-plum-bg text-partner-plum",
};

export function Avatar({
  name,
  color,
  className,
}: {
  name: string;
  color: PartnerColor;
  className?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium select-none",
        colorClasses[color],
        className
      )}
      aria-hidden={true}
    >
      {initial}
    </div>
  );
}
