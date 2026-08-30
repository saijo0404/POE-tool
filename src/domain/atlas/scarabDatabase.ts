import type { ScarabDef, PopularExtraItemDef } from './scarabs/types';
import { LEAGUE_SCARABS } from './scarabs/leagueScarabs';
import { BOSS_SCARABS } from './scarabs/bossScarabs';
import { POPULAR_EXTRA_ITEMS } from './scarabs/extraItemsData';

export type { ScarabDef, PopularExtraItemDef };
export { LEAGUE_SCARABS, BOSS_SCARABS, POPULAR_EXTRA_ITEMS };

export const SCARAB_DATABASE: ScarabDef[] = [
  ...LEAGUE_SCARABS,
  ...BOSS_SCARABS
];
