import type { PriceAlertRule } from './types';

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous <= 0) return 0;
  const change = ((current - previous) / previous) * 100;
  return Math.round(change * 10) / 10;
}

export function calculateAbsoluteChange(current: number, previous: number): number {
  return Math.round((current - previous) * 100) / 100;
}

export function formatTrendPercentage(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
}

export function isHighVolatility(change24hPercent: number, thresholdPercent: number = 10.0): boolean {
  return Math.abs(change24hPercent) >= thresholdPercent;
}

export function checkPriceAlert(
  rule: PriceAlertRule,
  currentChaos: number,
  currentDivine: number
): boolean {
  if (!rule.enabled) return false;

  const currentVal = rule.currency === 'divine' ? currentDivine : currentChaos;
  if (rule.condition === 'below') {
    return currentVal <= rule.threshold;
  }
  return currentVal >= rule.threshold;
}

export function generatePriceSparklinePoints(
  data: number[],
  width: number,
  height: number
): string {
  if (!data || data.length === 0) return '';
  if (data.length === 1) return `0,${height / 2} ${width},${height / 2}`;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const paddingY = 4;
  const availableHeight = height - paddingY * 2;

  const stepX = width / (data.length - 1);

  return data
    .map((val, idx) => {
      const x = Math.round(idx * stepX * 10) / 10;
      const normalizedY = (val - min) / range;
      const y = Math.round((height - paddingY - normalizedY * availableHeight) * 10) / 10;
      return `${x},${y}`;
    })
    .join(' ');
}
