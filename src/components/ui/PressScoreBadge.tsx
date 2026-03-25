interface PressScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function PressScoreBadge({ score, size = "md" }: PressScoreBadgeProps) {
  const bg =
    score >= 70 ? "bg-success" : score >= 40 ? "bg-warning" : "bg-error";

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl",
  };

  const level = score >= 70 ? "good" : score >= 40 ? "moderate" : "poor";

  return (
    <div
      className={`${bg} ${sizes[size]} rounded-full flex items-center justify-center text-white font-bold`}
      role="img"
      aria-label={`Press Score: ${score} out of 100, ${level}`}
    >
      {score}
    </div>
  );
}
