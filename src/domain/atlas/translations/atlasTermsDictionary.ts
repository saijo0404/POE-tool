import { POE_MECHANIC_TERMS } from './atlasMechanicTerms';
import { POE_MODIFIER_TERMS } from './atlasModifierTerms';

/**
 * Traditional Chinese unified dictionary for Path of Exile terminology
 */
export const POE_TERMS_DICTIONARY: Array<[RegExp, string]> = [
  ...POE_MECHANIC_TERMS,
  ...POE_MODIFIER_TERMS
];
