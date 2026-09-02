export function PinDots({
  value,
  length = 6,
}: {
  value: string;
  length?: number;
}) {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden={true}>
      {Array.from({ length }).map((_, i) => (
        <span
          key={i}
          className={`size-3.5 rounded-full border transition-colors ${
            i < value.length
              ? "border-primary bg-primary"
              : "border-border bg-background"
          }`}
        />
      ))}
    </div>
  );
}
