import type { AtlasMechanicCategory } from './types';

const MECHANIC_KEYWORDS: readonly [AtlasMechanicCategory, readonly string[]][] = [
  ['essence', ['essence', '精髓', 'shrieking', 'remnant']],
  ['ambush', ['strongbox', 'ambush', '伏擊', 'arcanist', 'diviner']],
  ['harvest', ['harvest', 'lifeforce', '莊園', 'crop', 'oshabi', 'sacred grove']],
  ['expedition', ['expedition', '探險', 'logbook', 'runic', 'dannig', 'tujen', 'gwennen', 'rog']],
  ['delirium', ['delirium', '譫妄', 'simulacrum', 'mirror of delirium', 'cluster jewel']],
  ['ritual', ['ritual', '祭祀', 'tribute', 'blood-filled']],
  ['breach', ['breach', '裂痕', 'chayula', 'breachstone', 'clasped hand']],
  ['legion', ['legion', '軍團', 'timeless', 'emblem', 'maraketh', 'templar']],
  ['beyond', ['beyond', '超越', 'scourge', 'demon', 'tainted']],
  ['blight', ['blight', '枯萎', 'cassia', 'oil', 'pump', 'blighted map']],
  ['scarab', ['scarab', '聖甲蟲', '甲蟲']],
  ['boss', ['maven', 'eater of worlds', 'searing exarch', 'eldritch', 'boss', '首領', 'conqueror', 'guardian', 'shaper', 'elder', 'invitation', 'cortex']],
  ['bestiary', ['einhar', 'bestiary', 'beast', '獵魔', 'red beast']],
  ['torment', ['torment', '苦痛', 'spirit', 'possess', 'seance']],
  ['map', ['map', '地圖', 'tier', 'kirac', 'scouting report', 'adjacent', 'connected map']]
];

export function detectMechanicCategory(
  name: string,
  stats: string[],
  icon?: string
): AtlasMechanicCategory {
  const combined = `${name} ${stats.join(' ')} ${icon || ''}`.toLowerCase();
  for (const [category, keywords] of MECHANIC_KEYWORDS) {
    if (keywords.some(k => combined.includes(k))) {
      return category;
    }
  }
  return 'general';
}
