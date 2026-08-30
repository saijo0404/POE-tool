import type { ScarabDef } from './types';

export const ENCOUNTER_SCARABS: ScarabDef[] = [
  // ================= Legion (戰亂/軍團) =================
  {
    id: 'legion_scarab',
    name: '戰亂甲蟲',
    nameEn: 'Legion Scarab',
    category: 'legion',
    limit: 4,
    description: '區域包含 1 個額外戰亂遭遇戰。',
    basePriceChaos: 5
  },
  {
    id: 'legion_scarab_officers',
    name: '官員之戰亂甲蟲',
    nameEn: 'Legion Scarab of Officers',
    category: 'legion',
    limit: 2,
    description: '戰亂遭遇戰各陣營均有 1 位副官率領，產出額外印記。',
    basePriceChaos: 20
  },
  {
    id: 'legion_scarab_commanders',
    name: '軍閥之戰亂甲蟲',
    nameEn: 'Legion Scarab of Commanders',
    category: 'legion',
    limit: 1,
    description: '戰亂遭遇戰各陣營均有 1 位將領率領。',
    basePriceChaos: 38
  },
  {
    id: 'legion_scarab_eternal',
    name: '永恆之戰亂甲蟲',
    nameEn: 'Legion Scarab of the Eternal Conflict',
    category: 'legion',
    limit: 1,
    description: '戰亂怪物可被多次喚醒，戰亂印記碎片產量提高。',
    basePriceChaos: 65
  },

  // ================= Breach (破滅裂痕) =================
  {
    id: 'breach_scarab',
    name: '破滅裂痕甲蟲',
    nameEn: 'Breach Scarab',
    category: 'breach',
    limit: 4,
    description: '區域包含額外 2 個破滅裂痕。',
    basePriceChaos: 4
  },
  {
    id: 'breach_scarab_splinters',
    name: '領地之破滅裂痕甲蟲',
    nameEn: 'Breach Scarab of the Dreamer',
    category: 'breach',
    limit: 2,
    description: '區域中裂痕開啟與開展速度加快，夏烏拉裂痕機率提升。',
    basePriceChaos: 22
  },
  {
    id: 'breach_scarab_lord',
    name: '領主之破滅裂痕甲蟲',
    nameEn: 'Breach Scarab of Lordship',
    category: 'breach',
    limit: 1,
    description: '破滅裂痕包含裂痕領主。',
    basePriceChaos: 35
  },
  {
    id: 'breach_scarab_resonant',
    name: '夢魘之破滅裂痕甲蟲',
    nameEn: 'Breach Scarab of Resonant Cascade',
    category: 'breach',
    limit: 1,
    description: '裂痕怪物密度與密度隨開展擴大，掉落大量裂痕石與碎片。',
    basePriceChaos: 60
  },

  // ================= Delirium (瞻妄之霧) =================
  {
    id: 'delirium_scarab',
    name: '瞻妄甲蟲',
    nameEn: 'Delirium Scarab',
    category: 'delirium',
    limit: 2,
    description: '區域包含瞻妄之鏡。',
    basePriceChaos: 5
  },
  {
    id: 'delirium_scarab_mania',
    name: '狂亂之瞻妄甲蟲',
    nameEn: 'Delirium Scarab of Mania',
    category: 'delirium',
    limit: 2,
    description: '區域中瞻妄獎勵條填滿速度提高 100%。',
    basePriceChaos: 32
  },
  {
    id: 'delirium_scarab_paranoia',
    name: '幻象之瞻妄甲蟲',
    nameEn: 'Delirium Scarab of Paranoia',
    category: 'delirium',
    limit: 2,
    description: '區域包含 2 種額外瞻妄獎勵類型。',
    basePriceChaos: 45
  }
];
