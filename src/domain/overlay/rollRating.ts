import type { RollRating } from './types';

/**
 * Calculates roll percentage and rating category for item affixes
 */
export function calculateRollRating(
  value?: number,
  minValue?: number,
  maxValue?: number,
  tier?: number
): RollRating {
  const tierText = typeof tier === 'number' && tier > 0 ? `T${tier}` : undefined;

  if (value === undefined && minValue === undefined && maxValue === undefined) {
    return { percentage: 0, ratingLabel: 'None', tierText };
  }

  if (minValue !== undefined && maxValue !== undefined) {
    if (maxValue === minValue) {
      return { percentage: 100, ratingLabel: 'Max', tierText };
    }

    const current = value ?? minValue;
    const rawRatio = (current - minValue) / (maxValue - minValue);
    const clampedRatio = Math.max(0, Math.min(rawRatio, 1));
    const percentage = Math.round(clampedRatio * 100);

    let ratingLabel: RollRating['ratingLabel'] = 'Low';
    if (percentage >= 95) ratingLabel = 'Max';
    else if (percentage >= 70) ratingLabel = 'High';
    else if (percentage >= 35) ratingLabel = 'Mid';

    return { percentage, ratingLabel, tierText };
  }

  return { percentage: 100, ratingLabel: 'None', tierText };
}
