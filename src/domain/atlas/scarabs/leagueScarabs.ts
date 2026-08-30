import type { ScarabDef } from './types';
import { LEAGUE_MECHANICS_SCARABS } from './leagueMechanicsScarabs';
import { ENCOUNTER_SCARABS } from './encounterScarabs';

export { LEAGUE_MECHANICS_SCARABS, ENCOUNTER_SCARABS };

export const LEAGUE_SCARABS: ScarabDef[] = [
  ...LEAGUE_MECHANICS_SCARABS,
  ...ENCOUNTER_SCARABS
];
