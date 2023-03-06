import { OlliValue } from "./Types";

export const fmtValue = (value: OlliValue, valueSuffix?: string): string => {
  const suffix = valueSuffix || '';
  if (value instanceof Date) {
      return value.toLocaleString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) + suffix;
  }
  else if (typeof value !== 'string' && (!isNaN(value) && value % 1 != 0)) {
      return Number(value).toFixed(2) + suffix;
  }
  return String(value) + suffix;
}