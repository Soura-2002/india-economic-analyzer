import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import { ForecastPoint } from "@/lib/analytics";
import { IndicatorKey, INDICATORS } from "@/data/economicData";

interface Props {
  data: ForecastPoint[];
  indicator: IndicatorKey;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const isForecast = payload[0]?.payload?.isForecast;
  return (
    <div className="bg-white border border-border rounded-lg px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-1">
        {label} {isForecast && <span className="text-xs font-normal text-orange-500 ml-1">(forecast)</span>}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.value?.toFixed(3)} {INDICATORS[p.name as IndicatorKey]?.unit ?? ""}
        </p>
      ))}
    </div>
  );
};

export default function TrendChart({ data, indicator }: Props) {
  const meta = INDICATORS[indicator];
  const lastActual = data.filter(d => !d.isForecast).slice(-1)[0];

  return (
    <ResponsiveContainer width="100%" height={380}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${indicator}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={meta.color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={meta.color} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id={`grad-${indicator}-forecast`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f97316" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
          tickFormatter={v => indicator === "gdp" ? `$${v}T` : `${v}%`}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        {lastActual && (
          <ReferenceLine
            x={lastActual.year}
            stroke="#d1d5db"
            strokeDasharray="4 2"
            label={{ value: "Forecast →", position: "insideTopRight", fontSize: 11, fill: "#9ca3af" }}
          />
        )}
        <Area
          type="monotone"
          dataKey="value"
          name={indicator}
          stroke={meta.color}
          strokeWidth={2.5}
          fill={`url(#grad-${indicator})`}
          dot={(props: any) => {
            if (!props.payload?.isForecast) return <circle key={props.key} cx={props.cx} cy={props.cy} r={3} fill={meta.color} stroke="white" strokeWidth={1.5} />;
            return <circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill="#f97316" stroke="white" strokeWidth={2} strokeDasharray="2 1" />;
          }}
          strokeDasharray={(d: any) => d?.isForecast ? "6 3" : ""}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
