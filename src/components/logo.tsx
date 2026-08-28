export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      role="img"
      aria-label="Duofin"
      className={className}
    >
      <circle cx="22" cy="20" r="16" fill="#1F6F5C" opacity="0.85" />
      <circle cx="42" cy="20" r="16" fill="#7A3F5E" opacity="0.85" />
      <ellipse cx="32" cy="20" rx="6.5" ry="13" fill="#C9A227" />
    </svg>
  );
}
