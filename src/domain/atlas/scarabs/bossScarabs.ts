import type { ScarabDef } from './types';
import { EXTRA_REWARD_SCARABS } from './extraRewardScarabs';
import { ENDGAME_BOSS_SCARABS } from './endgameBossScarabs';

export { EXTRA_REWARD_SCARABS, ENDGAME_BOSS_SCARABS };

export const BOSS_SCARABS: ScarabDef[] = [
  ...EXTRA_REWARD_SCARABS,
  ...ENDGAME_BOSS_SCARABS
];
