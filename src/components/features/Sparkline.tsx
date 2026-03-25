interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export function Sparkline({ data, width = 120, height = 32 }: SparklineProps) {
  if (data.length < 2) {
    return (
      <svg width={width} height={height} role="img" aria-label="Sentiment trend: no data">
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#94A3B8"
          strokeWidth={2}
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = padding + ((max - value) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const first = data[0];
  const last = data[data.length - 1];
  const diff = last - first;
  const threshold = 0.05;

  let strokeColor = "#94A3B8"; // gray/flat
  if (diff > threshold) strokeColor = "#10B981"; // green/positive
  else if (diff < -threshold) strokeColor = "#EF4444"; // red/negative

  return (
    <svg width={width} height={height} className="flex-shrink-0" role="img" aria-label={`Sentiment trend: ${diff > threshold ? "trending up" : diff < -threshold ? "trending down" : "stable"}`}>
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
