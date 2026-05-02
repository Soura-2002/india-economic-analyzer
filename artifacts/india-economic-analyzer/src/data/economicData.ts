export interface EconomicDataPoint {
  year: number;
  gdp: number;        // USD trillion
  inflation: number;  // CPI %
  unemployment: number; // %
}

export const ECONOMIC_DATA: EconomicDataPoint[] = [
  { year: 1991, gdp: 0.27, inflation: 13.87, unemployment: 4.20 },
  { year: 1992, gdp: 0.29, inflation: 11.79, unemployment: 4.30 },
  { year: 1993, gdp: 0.28, inflation: 6.36,  unemployment: 4.40 },
  { year: 1994, gdp: 0.33, inflation: 10.22, unemployment: 4.50 },
  { year: 1995, gdp: 0.37, inflation: 10.22, unemployment: 4.60 },
  { year: 1996, gdp: 0.40, inflation: 8.98,  unemployment: 4.50 },
  { year: 1997, gdp: 0.42, inflation: 7.16,  unemployment: 4.40 },
  { year: 1998, gdp: 0.43, inflation: 13.23, unemployment: 4.30 },
  { year: 1999, gdp: 0.47, inflation: 4.67,  unemployment: 4.20 },
  { year: 2000, gdp: 0.48, inflation: 4.01,  unemployment: 4.30 },
  { year: 2001, gdp: 0.49, inflation: 3.78,  unemployment: 4.40 },
  { year: 2002, gdp: 0.52, inflation: 4.30,  unemployment: 4.50 },
  { year: 2003, gdp: 0.61, inflation: 3.81,  unemployment: 4.60 },
  { year: 2004, gdp: 0.72, inflation: 3.77,  unemployment: 4.40 },
  { year: 2005, gdp: 0.83, inflation: 4.25,  unemployment: 4.20 },
  { year: 2006, gdp: 0.94, inflation: 6.15,  unemployment: 4.00 },
  { year: 2007, gdp: 1.22, inflation: 6.37,  unemployment: 3.80 },
  { year: 2008, gdp: 1.19, inflation: 8.35,  unemployment: 3.90 },
  { year: 2009, gdp: 1.34, inflation: 10.88, unemployment: 3.60 },
  { year: 2010, gdp: 1.66, inflation: 11.99, unemployment: 3.50 },
  { year: 2011, gdp: 1.82, inflation: 8.86,  unemployment: 3.60 },
  { year: 2012, gdp: 1.83, inflation: 9.30,  unemployment: 3.60 },
  { year: 2013, gdp: 1.86, inflation: 10.92, unemployment: 3.60 },
  { year: 2014, gdp: 2.04, inflation: 6.37,  unemployment: 3.50 },
  { year: 2015, gdp: 2.10, inflation: 5.88,  unemployment: 3.50 },
  { year: 2016, gdp: 2.29, inflation: 4.94,  unemployment: 3.50 },
  { year: 2017, gdp: 2.65, inflation: 3.60,  unemployment: 3.50 },
  { year: 2018, gdp: 2.71, inflation: 3.43,  unemployment: 3.40 },
  { year: 2019, gdp: 2.87, inflation: 4.76,  unemployment: 5.27 },
  { year: 2020, gdp: 2.67, inflation: 6.62,  unemployment: 7.11 },
  { year: 2021, gdp: 3.18, inflation: 5.13,  unemployment: 5.98 },
  { year: 2022, gdp: 3.39, inflation: 6.70,  unemployment: 7.33 },
  { year: 2023, gdp: 3.73, inflation: 5.40,  unemployment: 7.80 },
];

export type IndicatorKey = "gdp" | "inflation" | "unemployment";

export const INDICATORS: Record<IndicatorKey, { label: string; unit: string; color: string; description: string }> = {
  gdp:          { label: "GDP",          unit: "USD Trillion", color: "#f97316", description: "Gross Domestic Product at current prices" },
  inflation:    { label: "Inflation",    unit: "%",            color: "#dc2626", description: "Consumer Price Index annual % change" },
  unemployment: { label: "Unemployment", unit: "%",            color: "#16a34a", description: "% of total labour force unemployed" },
};

export const MIN_YEAR = ECONOMIC_DATA[0].year;
export const MAX_YEAR = ECONOMIC_DATA[ECONOMIC_DATA.length - 1].year;
