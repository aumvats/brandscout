interface UsageMeterProps {
  used: number;
  limit: number;
}

export function UsageMeter({ used, limit }: UsageMeterProps) {
  const pct = Math.min((used / limit) * 100, 100);

  return (
    <div>
      <p className="text-sm text-text-secondary mb-1.5">
        {used}/{limit} brands used
      </p>
      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-normal"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
