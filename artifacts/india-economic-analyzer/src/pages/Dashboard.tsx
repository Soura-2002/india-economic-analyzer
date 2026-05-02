import { useState, useMemo, useRef } from "react";
import { Download, TrendingUp, BarChart2, GitCompare, Lightbulb, Table2, ChevronDown } from "lucide-react";
import { ECONOMIC_DATA, INDICATORS, IndicatorKey, MIN_YEAR, MAX_YEAR } from "@/data/economicData";
import { filterData, calculateGrowth, forecastLinear, normaliseForComparison, generateInsights } from "@/lib/analytics";
import TrendChart from "@/components/TrendChart";
import GrowthChart from "@/components/GrowthChart";
import ComparisonChart from "@/components/ComparisonChart";
import KpiCard from "@/components/KpiCard";

const TABS = [
  { id: "trend",      label: "Trend",      Icon: TrendingUp  },
  { id: "growth",     label: "YoY Growth", Icon: BarChart2   },
  { id: "compare",    label: "Compare All",Icon: GitCompare  },
  { id: "insights",   label: "Insights",   Icon: Lightbulb   },
] as const;

type TabId = typeof TABS[number]["id"];

export default function Dashboard() {
  const [indicator, setIndicator]     = useState<IndicatorKey>("gdp");
  const [yearRange, setYearRange]     = useState<[number, number]>([2000, MAX_YEAR]);
  const [showForecast, setShowForecast] = useState(false);
  const [showTable, setShowTable]     = useState(false);
  const [activeTab, setActiveTab]     = useState<TabId>("trend");
  const printRef = useRef<HTMLDivElement>(null);

  const meta = INDICATORS[indicator];

  const filtered = useMemo(
    () => filterData(ECONOMIC_DATA, yearRange[0], yearRange[1]),
    [yearRange]
  );

  const growthData = useMemo(
    () => calculateGrowth(filtered, indicator),
    [filtered, indicator]
  );

  const forecastData = useMemo(
    () => forecastLinear(filtered, indicator, 2),
    [filtered, indicator]
  );

  const compData = useMemo(
    () => normaliseForComparison(filtered),
    [filtered]
  );

  const insights = useMemo(
    () => generateInsights(growthData, meta.label),
    [growthData, meta.label]
  );

  // KPI values
  const latest = growthData[growthData.length - 1];
  const latestVal = latest?.value;
  const latestGrowth = latest?.growth;
  const periodGrowth = filtered.length >= 2
    ? ((filtered[filtered.length - 1][indicator] - filtered[0][indicator]) / filtered[0][indicator]) * 100
    : null;
  const valid = growthData.filter(g => g.growth !== null);
  const bestYear = valid.length ? valid.reduce((a, b) => (b.growth! > a.growth! ? b : a)) : null;

  const handleDownloadReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = generateReportHTML({
      indicator,
      meta,
      yearRange,
      filtered,
      growthData,
      insights,
      showForecast,
      forecastData,
    });

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 600);
  };

  const fmtVal = (v: number | undefined) =>
    v === undefined ? "—"
    : indicator === "gdp" ? `$${v.toFixed(2)}T`
    : `${v.toFixed(2)}%`;

  const fmtPct = (v: number | null | undefined) =>
    v === null || v === undefined ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;

  return (
    <div className="min-h-screen bg-background" ref={printRef}>
      {/* ── Header ── */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          {/* India flag colours bar */}
          <div className="flex flex-col gap-0.5 rounded overflow-hidden shadow-sm w-3 h-9 shrink-0">
            <div className="flex-1 bg-orange-500" />
            <div className="flex-1 bg-white border-y border-gray-100" />
            <div className="flex-1 bg-green-700" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
              India Economic Trends Analyzer
            </h1>
            <p className="text-xs text-muted-foreground">GDP · Inflation · Unemployment · 1991–2023</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Source: World Bank / IMF estimates</span>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">

          {/* Indicator */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Indicator</p>
            <div className="flex flex-col gap-2">
              {(Object.keys(INDICATORS) as IndicatorKey[]).map(key => {
                const m = INDICATORS[key];
                const active = indicator === key;
                return (
                  <button
                    key={key}
                    onClick={() => setIndicator(key)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent text-foreground"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m.color }} />
                    <span className="leading-tight">
                      {m.label}
                      <span className={`block text-xs font-normal ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {m.unit}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Year Range */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Year Range</p>
            <div className="flex justify-between text-sm font-semibold text-foreground mb-2">
              <span>{yearRange[0]}</span>
              <span>→</span>
              <span>{yearRange[1]}</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">From</label>
                <input
                  type="range"
                  min={MIN_YEAR} max={yearRange[1] - 1} step={1}
                  value={yearRange[0]}
                  onChange={e => setYearRange([+e.target.value, yearRange[1]])}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">To</label>
                <input
                  type="range"
                  min={yearRange[0] + 1} max={MAX_YEAR} step={1}
                  value={yearRange[1]}
                  onChange={e => setYearRange([yearRange[0], +e.target.value])}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">{filtered.length} years selected</p>
          </div>

          {/* Forecast */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Forecast</p>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setShowForecast(!showForecast)}
                className={`relative w-10 h-5 rounded-full transition-colors ${showForecast ? "bg-primary" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showForecast ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm text-foreground">Next 2-year forecast</span>
            </label>
            {showForecast && (
              <p className="mt-2 text-xs text-muted-foreground">
                Linear regression on selected range.
                {forecastData.filter(d => d.isForecast).map(d => (
                  <span key={d.year} className="block text-orange-600 font-medium">
                    {d.year}: {fmtVal(d.value)}
                  </span>
                ))}
              </p>
            )}
          </div>

          {/* Report */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Export Report</p>
            <button
              onClick={handleDownloadReport}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-2.5 text-sm font-semibold transition-all shadow-sm hover:shadow"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <p className="text-xs text-muted-foreground mt-2 text-center">Opens print dialog (PDF/HTML)</p>
          </div>

          {/* Table toggle */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setShowTable(!showTable)}
                className={`relative w-10 h-5 rounded-full transition-colors ${showTable ? "bg-primary" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showTable ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm text-foreground flex items-center gap-1.5">
                <Table2 className="w-3.5 h-3.5" /> Raw Data Table
              </span>
            </label>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard
              label="Latest Value"
              value={fmtVal(latestVal)}
              subtext={`${latest?.year ?? "—"}`}
              highlight
            />
            <KpiCard
              label="YoY Change"
              value={fmtPct(latestGrowth)}
              subtext={`${latest?.year ? latest.year - 1 : "—"} → ${latest?.year ?? "—"}`}
              trend={latestGrowth === null ? "neutral" : latestGrowth >= 0 ? "up" : "down"}
            />
            <KpiCard
              label="Period Growth"
              value={fmtPct(periodGrowth)}
              subtext={`${yearRange[0]}–${yearRange[1]}`}
              trend={periodGrowth === null ? "neutral" : periodGrowth >= 0 ? "up" : "down"}
            />
            <KpiCard
              label="Best Year"
              value={bestYear ? `${bestYear.year}` : "—"}
              subtext={bestYear ? `+${bestYear.growth?.toFixed(1)}% growth` : ""}
              trend="up"
            />
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="flex border-b overflow-x-auto">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                    activeTab === id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === "trend" && (
                <div>
                  <h2 className="text-base font-semibold text-foreground mb-1">
                    {meta.label} Trend · {yearRange[0]}–{yearRange[1]}{showForecast ? " + Forecast" : ""}
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">{meta.description}</p>
                  <TrendChart
                    data={showForecast ? forecastData : forecastData.filter(d => !d.isForecast)}
                    indicator={indicator}
                  />
                </div>
              )}

              {activeTab === "growth" && (
                <div>
                  <h2 className="text-base font-semibold text-foreground mb-1">
                    {meta.label} — Year-over-Year Growth (%)
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">Green = growth, Red = contraction</p>
                  <GrowthChart data={growthData} indicator={indicator} />
                </div>
              )}

              {activeTab === "compare" && (
                <div>
                  <h2 className="text-base font-semibold text-foreground mb-1">
                    Indicator Comparison · {yearRange[0]}–{yearRange[1]}
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    All indicators normalised to index 100 at {yearRange[0]} for direct comparison.
                  </p>
                  <ComparisonChart data={compData} />
                </div>
              )}

              {activeTab === "insights" && (
                <div>
                  <h2 className="text-base font-semibold text-foreground mb-4">
                    Auto-Generated Insights · {meta.label}
                  </h2>
                  <ul className="space-y-3">
                    {insights.map((insight, i) => {
                      const colors = {
                        positive: "border-green-500 bg-green-50 text-green-800",
                        negative: "border-red-400 bg-red-50 text-red-800",
                        info: "border-blue-400 bg-blue-50 text-blue-800",
                        neutral: "border-gray-300 bg-gray-50 text-gray-700",
                      };
                      return (
                        <li key={i} className={`border-l-4 rounded-r-lg px-4 py-3 text-sm leading-relaxed ${colors[insight.type]}`}>
                          {insight.text}
                        </li>
                      );
                    })}
                  </ul>
                  {showForecast && (
                    <div className="mt-5 border-l-4 border-orange-400 bg-orange-50 rounded-r-lg px-4 py-3">
                      <p className="text-sm font-semibold text-orange-800 mb-1">Linear Forecast (next 2 years)</p>
                      {forecastData.filter(d => d.isForecast).map(d => (
                        <p key={d.year} className="text-sm text-orange-700">
                          {d.year}: {fmtVal(d.value)}
                        </p>
                      ))}
                      <p className="text-xs text-orange-600 mt-1">Based on OLS linear regression on selected period.</p>
                    </div>
                  )}
                  <p className="mt-4 text-xs text-muted-foreground">
                    Note: Insights are computed automatically from {yearRange[0]}–{yearRange[1]} data. Source: World Bank / IMF estimates.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Data Table */}
          {showTable && (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center gap-2">
                <Table2 className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">
                  Raw Data · {meta.label} · {yearRange[0]}–{yearRange[1]}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Year</th>
                      <th className="text-right px-5 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{meta.label}</th>
                      <th className="text-right px-5 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">YoY Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {growthData.map((row, i) => (
                      <tr key={row.year} className={`border-t ${i % 2 === 0 ? "" : "bg-muted/20"} hover:bg-accent/50 transition-colors`}>
                        <td className="px-5 py-2.5 font-medium text-foreground">{row.year}</td>
                        <td className="px-5 py-2.5 text-right text-foreground">{fmtVal(row.value)}</td>
                        <td className={`px-5 py-2.5 text-right font-medium ${
                          row.growth === null ? "text-muted-foreground"
                          : row.growth >= 0 ? "text-green-600" : "text-red-500"
                        }`}>
                          {row.growth === null ? "—" : `${row.growth > 0 ? "+" : ""}${row.growth.toFixed(2)}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t mt-8 py-4 text-center text-xs text-muted-foreground">
        India Economic Trends Analyzer · Data: World Bank / IMF · Built with React + Recharts
      </footer>
    </div>
  );
}

/* ── Report HTML generator ── */
function generateReportHTML({ indicator, meta, yearRange, filtered, growthData, insights, showForecast, forecastData }: any) {
  const fmtVal = (v: number) => indicator === "gdp" ? `$${v.toFixed(2)}T` : `${v.toFixed(2)}%`;
  const latest = growthData[growthData.length - 1];
  const first  = growthData[0];
  const totalPct = ((latest.value - first.value) / first.value * 100).toFixed(1);
  const valid = growthData.filter((g: any) => g.growth !== null);
  const best  = valid.length ? valid.reduce((a: any, b: any) => b.growth > a.growth ? b : a) : null;

  const rows = growthData.map((r: any) => `
    <tr>
      <td>${r.year}</td>
      <td>${fmtVal(r.value)}</td>
      <td style="color:${r.growth === null ? '#999' : r.growth >= 0 ? '#16a34a' : '#dc2626'}">
        ${r.growth === null ? "—" : `${r.growth > 0 ? "+" : ""}${r.growth.toFixed(2)}%`}
      </td>
    </tr>`).join("");

  const insightList = insights.map((ins: any) =>
    `<li style="margin-bottom:8px;color:${ins.type === 'positive' ? '#15803d' : ins.type === 'negative' ? '#dc2626' : '#1d4ed8'}">${ins.text}</li>`
  ).join("");

  const forecastRows = showForecast
    ? forecastData.filter((d: any) => d.isForecast).map((d: any) =>
        `<li>${d.year}: ${fmtVal(d.value)} <em>(linear forecast)</em></li>`
      ).join("")
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>India Economic Report – ${meta.label} ${yearRange[0]}–${yearRange[1]}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 24px; color: #1a1a2e; }
    h1 { font-size: 1.6rem; color: #f97316; margin-bottom: 4px; }
    h2 { font-size: 1.1rem; border-bottom: 2px solid #f97316; padding-bottom: 6px; margin-top: 28px; }
    .meta { color: #6b7280; font-size: 0.85rem; margin-bottom: 24px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
    .kpi { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; }
    .kpi-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 4px; }
    .kpi-val { font-size: 1.4rem; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 0.88rem; }
    th { text-align: left; padding: 8px 10px; background: #f3f4f6; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; }
    td { padding: 7px 10px; border-top: 1px solid #f3f4f6; }
    ul { padding-left: 1.2em; }
    li { margin-bottom: 6px; font-size: 0.9rem; }
    .flag-bar { display: flex; gap: 0; height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 16px; }
    .flag-bar div { flex: 1; }
    footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 0.75rem; color: #9ca3af; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="flag-bar">
    <div style="background:#f97316"></div>
    <div style="background:#fff;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb"></div>
    <div style="background:#16a34a"></div>
  </div>
  <h1>India Economic Trends Report</h1>
  <div class="meta">${meta.label} · ${yearRange[0]}–${yearRange[1]} · Generated ${new Date().toLocaleDateString()}</div>

  <h2>Executive Summary</h2>
  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-label">Latest Value</div><div class="kpi-val">${fmtVal(latest.value)}</div></div>
    <div class="kpi"><div class="kpi-label">Latest YoY</div><div class="kpi-val">${latest.growth !== null ? (latest.growth > 0 ? "+" : "") + latest.growth.toFixed(1) + "%" : "—"}</div></div>
    <div class="kpi"><div class="kpi-label">Period Growth</div><div class="kpi-val">${totalPct}%</div></div>
    <div class="kpi"><div class="kpi-label">Best Year</div><div class="kpi-val">${best ? best.year : "—"}</div></div>
  </div>
  <p>Over ${yearRange[0]}–${yearRange[1]}, India's ${meta.label} ${parseFloat(totalPct) >= 0 ? "grew" : "fell"} by ${Math.abs(parseFloat(totalPct))}%.</p>

  <h2>Auto-Generated Insights</h2>
  <ul>${insightList}</ul>

  ${forecastRows ? `<h2>Forecast</h2><ul>${forecastRows}</ul>` : ""}

  <h2>Annual Data Table</h2>
  <table>
    <tr><th>Year</th><th>${meta.label}</th><th>YoY Change</th></tr>
    ${rows}
  </table>

  <footer>Data: World Bank / IMF estimates · India Economic Trends Analyzer</footer>
</body>
</html>`;
}
