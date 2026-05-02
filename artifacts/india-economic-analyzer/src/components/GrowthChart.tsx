import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { GrowthPoint } from "@/lib/analytics";
import { IndicatorKey } from "@/data/economicData";

interface Props {
  data: GrowthPoint[];
  indicator: IndicatorKey;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const growth = payload[0]?.value;
  const color = growth >= 0 ? "#16a34a" : "#dc2626";
  return (
    <div className="bg-white border border-border rounded-lg px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p style={{ color }} className="font-medium">
        {growth > 0 ? "+" : ""}{growth?.toFixed(2)}% YoY
      </p>
    </div>
  );
};

export default function GrowthChart({ data }: Props) {
  const validData = data.filter(d => d.growth !== null);

  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart data={validData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
          interval={2}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${v}%`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
        <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1.5} />
        <Bar dataKey="growth" radius={[3, 3, 0, 0]} maxBarSize={32}>
          {validData.map((entry, i) => (
            <Cell
              key={`cell-${i}`}
              fill={(entry.growth ?? 0) >= 0 ? "#16a34a" : "#dc2626"}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
