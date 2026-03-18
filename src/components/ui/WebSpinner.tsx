interface WebSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: 24,
  md: 48,
  lg: 72,
};

export function WebSpinner({ size = "md", className = "" }: WebSpinnerProps) {
  const s = sizes[size];
  const r = s * 0.38;
  const center = s / 2;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className={`animate-spin ${className}`}
      style={{ animationDuration: "1.2s" }}
      role="status"
      aria-label="Loading"
    >
      {/* Outer web ring */}
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={size === "sm" ? 1.5 : 2}
        strokeLinecap="round"
        strokeDasharray={`${r * Math.PI * 0.6} ${r * Math.PI * 1.4}`}
        className="text-accent"
      />
      {/* Inner web ring */}
      <circle
        cx={center}
        cy={center}
        r={r * 0.55}
        fill="none"
        stroke="currentColor"
        strokeWidth={size === "sm" ? 1 : 1.5}
        strokeLinecap="round"
        strokeDasharray={`${r * 0.55 * Math.PI * 0.4} ${r * 0.55 * Math.PI * 1.6}`}
        className="text-muted-foreground"
        style={{ animationDirection: "reverse" }}
      />
      {/* Web radial lines */}
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1={center}
            y1={center}
            x2={center + Math.cos(rad) * r}
            y2={center + Math.sin(rad) * r}
            stroke="currentColor"
            strokeWidth={size === "sm" ? 0.5 : 0.75}
            className="text-border"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
