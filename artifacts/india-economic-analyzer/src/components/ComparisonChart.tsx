import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface CompData {
  year: number;
  gdpIdx: number;
  inflationIdx: number;
  unemploymentIdx: number;
}

interface Props {
  data: CompData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium text-xs">
          {p.name}: {p.value?.toFixed(1)}
        </p>
      ))}
    </div>
  );
};

const NAMES: Record<string, string> = {
  gdpIdx: "GDP",
  inflationIdx: "Inflation",
  unemploymentIdx: "Unemployment",
};

export default function ComparisonChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={380}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={v => `${v}`}
          label={{ value: "Index (base=100)", angle: -90, position: "insideLeft", offset: -2, fontSize: 11, fill: "#9ca3af" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => NAMES[value] ?? value}
          wrapperStyle={{ fontSize: 13 }}
        />
        <Line type="monotone" dataKey="gdpIdx"          name="gdpIdx"          stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="inflationIdx"    name="inflationIdx"    stroke="#dc2626" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="unemploymentIdx" name="unemploymentIdx" stroke="#16a34a" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
