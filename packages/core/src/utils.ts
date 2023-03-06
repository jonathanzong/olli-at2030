import { OlliConfigOptions } from ".";
import { OlliValue } from "./Types";

export const fmtValue = (value: OlliValue, field?: string, config?: OlliConfigOptions): string => {
  const suffix = (field ? config?.fieldValueSuffix?.[field] : '') || '';
  if (value instanceof Date) {
      return value.toLocaleString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) + suffix;
  }
  else if (typeof value !== 'string' && (!isNaN(value) && value % 1 != 0)) {
      return Number(value).toFixed(2) + suffix;
  }
  return String(value) + suffix;
}

export const fmtField = (fieldName: string, config?: OlliConfigOptions): string => {
  return config?.fieldLabels?.[fieldName] || fieldName;
}