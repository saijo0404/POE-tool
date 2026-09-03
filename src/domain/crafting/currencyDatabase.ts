import type { EssenceDefinition, FossilDefinition } from './types';

export const ESSENCE_LIST: EssenceDefinition[] = [
  { id: 'essence_greed', name: 'Deafening Essence of Greed', nameZh: '破空之哀傷精髓', guaranteedGroup: 'Life', guaranteedTier: 1, defaultPriceChaos: 4, icon: 'greed' },
  { id: 'essence_wrath', name: 'Deafening Essence of Wrath', nameZh: '破空之肆虐精髓', guaranteedGroup: 'LightningResistance', guaranteedTier: 1, defaultPriceChaos: 4, icon: 'wrath' },
  { id: 'essence_anger', name: 'Deafening Essence of Anger', nameZh: '破空之忿怒精髓', guaranteedGroup: 'FireResistance', guaranteedTier: 1, defaultPriceChaos: 4, icon: 'anger' },
  { id: 'essence_hatred', name: 'Deafening Essence of Hatred', nameZh: '破空之悲痛精髓', guaranteedGroup: 'ColdResistance', guaranteedTier: 1, defaultPriceChaos: 4, icon: 'hatred' },
  { id: 'essence_envy', name: 'Deafening Essence of Envy', nameZh: '破空之妒忌精髓', guaranteedGroup: 'ChaosResistance', guaranteedTier: 1, defaultPriceChaos: 8, icon: 'envy' },
  { id: 'essence_zeal', name: 'Deafening Essence of Zeal', nameZh: '破空之熱惱精髓', guaranteedGroup: 'AttackSpeed', guaranteedTier: 1, defaultPriceChaos: 5, icon: 'zeal' },
  { id: 'essence_loathing', name: 'Deafening Essence of Loathing', nameZh: '破空之諂媚精髓', guaranteedGroup: 'SpellSuppression', guaranteedTier: 1, defaultPriceChaos: 12, icon: 'loathing' },
  { id: 'essence_scorn', name: 'Deafening Essence of Scorn', nameZh: '破空之極懼精髓', guaranteedGroup: 'CriticalMultiplier', guaranteedTier: 1, defaultPriceChaos: 15, icon: 'scorn' },
  { id: 'essence_contempt', name: 'Deafening Essence of Contempt', nameZh: '破空之輕蔑精髓', guaranteedGroup: 'FlatPhysicalDamage', guaranteedTier: 1, defaultPriceChaos: 5, icon: 'contempt' },
];

export const FOSSIL_LIST: FossilDefinition[] = [
  { id: 'pristine_fossil', name: 'Pristine Fossil', nameZh: '原始化石 (生命)', positiveTags: ['life'], positiveMultiplier: 10, blockedTags: ['defences'], defaultPriceChaos: 3, icon: 'pristine' },
  { id: 'dense_fossil', name: 'Dense Fossil', nameZh: '緻密化石 (防禦)', positiveTags: ['defences'], positiveMultiplier: 10, blockedTags: ['life'], defaultPriceChaos: 2, icon: 'dense' },
  { id: 'prismatic_fossil', name: 'Prismatic Fossil', nameZh: '稜面化石 (元素)', positiveTags: ['elemental'], positiveMultiplier: 10, blockedTags: ['physical', 'chaos'], defaultPriceChaos: 4, icon: 'prismatic' },
  { id: 'metallic_fossil', name: 'Metallic Fossil', nameZh: '金燦化石 (閃電)', positiveTags: ['lightning'], positiveMultiplier: 10, blockedTags: ['physical'], defaultPriceChaos: 2, icon: 'metallic' },
  { id: 'jagged_fossil', name: 'Jagged Fossil', nameZh: '鋸齒化石 (物理)', positiveTags: ['physical'], positiveMultiplier: 10, blockedTags: ['chaos'], defaultPriceChaos: 2, icon: 'jagged' },
  { id: 'aberrant_fossil', name: 'Aberrant Fossil', nameZh: '畸變化石 (混沌)', positiveTags: ['chaos'], positiveMultiplier: 10, blockedTags: ['lightning'], defaultPriceChaos: 3, icon: 'aberrant' },
  { id: 'corroded_fossil', name: 'Corroded Fossil', nameZh: '腐蝕化石 (毒/混沌)', positiveTags: ['chaos'], positiveMultiplier: 10, blockedTags: ['elemental'], defaultPriceChaos: 5, icon: 'corroded' },
  { id: 'frigid_fossil', name: 'Frigid Fossil', nameZh: '凜冽化石 (冰冷)', positiveTags: ['cold'], positiveMultiplier: 10, blockedTags: ['fire'], defaultPriceChaos: 2, icon: 'frigid' },
  { id: 'scorched_fossil', name: 'Scorched Fossil', nameZh: '灼炎化石 (火焰)', positiveTags: ['fire'], positiveMultiplier: 10, blockedTags: ['cold'], defaultPriceChaos: 2, icon: 'scorched' },
];

export const RESONATOR_PRICES: Record<number, number> = {
  1: 1,  // Primitive Chaotic Resonator
  2: 3,  // Potent Chaotic Resonator
  3: 15, // Powerful Chaotic Resonator
};

export const HARVEST_CRAFT_COST_CHAOS = 3;
export const CHAOS_SPAM_COST_CHAOS = 1;
