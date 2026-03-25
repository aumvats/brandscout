"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

interface TrendChartProps {
  data: { date: string; score: number }[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-60 bg-surface border border-border rounded-md flex items-center justify-center text-text-secondary text-sm">
        No trend data available yet
      </div>
    );
  }

  return (
    <div className="w-full h-60 bg-surface border border-border rounded-md p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#64748B" }}
            tickLine={false}
            axisLine={{ stroke: "#E2E8F0" }}
          />
          <YAxis
            domain={[-1, 1]}
            tick={{ fontSize: 12, fill: "#64748B" }}
            tickLine={false}
            axisLine={{ stroke: "#E2E8F0" }}
            ticks={[-1, -0.5, 0, 0.5, 1]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              fontSize: "13px",
            }}
            formatter={(value) => [Number(value).toFixed(2), "Sentiment"]}
          />
          <Area
            type="monotone"
            dataKey="score"
            fill="#0891B2"
            fillOpacity={0.1}
            stroke="none"
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#0891B2"
            strokeWidth={2}
            dot={{ r: 3, fill: "#0891B2" }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
