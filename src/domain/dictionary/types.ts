export interface StatDictionaryEntry {
  id: string;
  zhText: string;
  enText: string;
}

export interface StatMatchResult {
  id: string;
  enText: string;
  value?: number;
  minValue?: number;
  maxValue?: number;
}

export interface BaseTypeMapping {
  zh: string;
  en: string;
}
