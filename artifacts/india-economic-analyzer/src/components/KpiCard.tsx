import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  highlight?: boolean;
}

export default function KpiCard({ label, value, subtext, trend, highlight }: Props) {
  return (
    <div className={`rounded-xl border bg-card p-5 shadow-sm flex flex-col gap-1 transition-all hover:-translate-y-0.5 hover:shadow-md ${highlight ? "border-primary/30 bg-primary/5" : ""}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="flex items-end gap-2 mt-1">
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        {trend === "up"      && <TrendingUp  className="w-4 h-4 text-green-600 mb-0.5 shrink-0" />}
        {trend === "down"    && <TrendingDown className="w-4 h-4 text-red-500   mb-0.5 shrink-0" />}
        {trend === "neutral" && <Minus        className="w-4 h-4 text-gray-400  mb-0.5 shrink-0" />}
      </div>
      {subtext && <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>}
    </div>
  );
}
