import { EconomicDataPoint, IndicatorKey } from "@/data/economicData";

export interface GrowthPoint {
  year: number;
  value: number;
  growth: number | null; // YoY % change
}

export interface ForecastPoint {
  year: number;
  value: number;
  isForecast: boolean;
}

/** Clean data: filter to year range, ensure sorted */
export function filterData(data: EconomicDataPoint[], minYear: number, maxYear: number): EconomicDataPoint[] {
  return data
    .filter(d => d.year >= minYear && d.year <= maxYear)
    .sort((a, b) => a.year - b.year);
}

/** Calculate year-over-year growth for an indicator */
export function calculateGrowth(data: EconomicDataPoint[], indicator: IndicatorKey): GrowthPoint[] {
  return data.map((d, i) => {
    const prev = data[i - 1];
    const value = d[indicator];
    const growth = prev ? ((value - prev[indicator]) / prev[indicator]) * 100 : null;
    return { year: d.year, value, growth: growth !== null ? parseFloat(growth.toFixed(2)) : null };
  });
}

/** Linear regression forecast for next N years */
export function forecastLinear(data: EconomicDataPoint[], indicator: IndicatorKey, nAhead = 2): ForecastPoint[] {
  const n = data.length;
  if (n < 2) return [];

  const xs = data.map(d => d.year);
  const ys = data.map(d => d[indicator]);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;

  const slope = xs.reduce((sum, x, i) => sum + (x - xMean) * (ys[i] - yMean), 0) /
                xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0);
  const intercept = yMean - slope * xMean;

  const predict = (x: number) => slope * x + intercept;

  const lastYear = xs[xs.length - 1];

  // Actuals + forecast combined (for chart bridging)
  const actuals: ForecastPoint[] = data.map(d => ({
    year: d.year,
    value: d[indicator],
    isForecast: false,
  }));

  const forecasts: ForecastPoint[] = Array.from({ length: nAhead }, (_, i) => ({
    year: lastYear + i + 1,
    value: parseFloat(predict(lastYear + i + 1).toFixed(4)),
    isForecast: true,
  }));

  return [...actuals, ...forecasts];
}

/** Normalise all indicators to index 100 at start of range */
export function normaliseForComparison(data: EconomicDataPoint[]): Array<{
  year: number;
  gdpIdx: number;
  inflationIdx: number;
  unemploymentIdx: number;
}> {
  if (data.length === 0) return [];
  const base = data[0];
  return data.map(d => ({
    year: d.year,
    gdpIdx:          parseFloat(((d.gdp          / base.gdp)          * 100).toFixed(1)),
    inflationIdx:    parseFloat(((d.inflation    / base.inflation)    * 100).toFixed(1)),
    unemploymentIdx: parseFloat(((d.unemployment / base.unemployment) * 100).toFixed(1)),
  }));
}

export interface Insight {
  text: string;
  type: "info" | "positive" | "negative" | "neutral";
}

/** Auto-generate human-readable insights */
export function generateInsights(growthData: GrowthPoint[], label: string): Insight[] {
  const insights: Insight[] = [];
  if (growthData.length < 2) return [{ text: "Not enough data for insights.", type: "neutral" }];

  const latest = growthData[growthData.length - 1];
  const prev   = growthData[growthData.length - 2];
  const valid  = growthData.filter(g => g.growth !== null) as Array<GrowthPoint & { growth: number }>;

  // YoY
  if (latest.growth !== null) {
    const dir = latest.growth >= 0 ? "increased" : "decreased";
    const type = latest.growth >= 0 ? "positive" : "negative";
    insights.push({
      text: `${label} ${dir} by ${Math.abs(latest.growth).toFixed(2)}% from ${prev.year} to ${latest.year}.`,
      type,
    });
  }

  // Overall period
  const first = growthData[0];
  const totalPct = ((latest.value - first.value) / first.value) * 100;
  const overallDir = totalPct >= 0 ? "grown" : "declined";
  insights.push({
    text: `Over ${first.year}–${latest.year}, ${label} has ${overallDir} by ${Math.abs(totalPct).toFixed(1)}% overall.`,
    type: totalPct >= 0 ? "positive" : "negative",
  });

  // Best year
  if (valid.length > 0) {
    const best  = valid.reduce((a, b) => b.growth > a.growth ? b : a);
    const worst = valid.reduce((a, b) => b.growth < a.growth ? b : a);
    insights.push({
      text: `Best year: ${best.year} (+${best.growth.toFixed(2)}%). Worst year: ${worst.year} (${worst.growth.toFixed(2)}%).`,
      type: "info",
    });
  }

  // Trend direction in recent 3 years
  if (valid.length >= 3) {
    const recent = valid.slice(-3);
    const avgRecent = recent.reduce((s, g) => s + g.growth, 0) / 3;
    const trendDir = avgRecent > 0 ? "upward" : "downward";
    insights.push({
      text: `Recent 3-year trend is ${trendDir} with an average growth of ${avgRecent.toFixed(2)}% per year.`,
      type: avgRecent > 0 ? "positive" : "negative",
    });
  }

  return insights;
}
