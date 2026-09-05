import type { BaseTypeMapping } from './types';

const STATIC_BASE_MAPPINGS: BaseTypeMapping[] = [
  // Waystones (尋路石)
  { zh: '尋路石', en: 'Waystone' },
  { zh: '銘刻尋路石', en: 'Inscribed Waystone' },
  { zh: '塔樓尋路石', en: 'Tower Waystone' },

  // Uncut Gems (未切割寶石)
  { zh: '未切割技能寶石', en: 'Uncut Skill Gem' },
  { zh: '未切割精魂寶石', en: 'Uncut Spirit Gem' },
  { zh: '未切割輔助寶石', en: 'Uncut Support Gem' },

  // Runes (符文)
  { zh: '符文', en: 'Rune' },
  { zh: '太陽符文', en: 'Sun Rune' },
  { zh: '鐵符文', en: 'Iron Rune' },
  { zh: '心靈符文', en: 'Mind Rune' },
  { zh: '石之符文', en: 'Stone Rune' },
  { zh: '風暴符文', en: 'Storm Rune' },
  { zh: '冰川符文', en: 'Glacial Rune' },
  { zh: '沙漠符文', en: 'Desert Rune' },
  { zh: '劇毒符文', en: 'Poison Rune' },

  // Currencies & Gold
  { zh: '金幣', en: 'Gold' },
  { zh: '高階重鑄石', en: 'Greater Orb of Scouring' },
  { zh: '次級重鑄石', en: 'Lesser Orb of Scouring' },
  { zh: '高階點金石', en: 'Greater Orb of Alchemy' },
  { zh: '次級點金石', en: 'Lesser Orb of Alchemy' },
  { zh: '重挫石', en: 'Orb of Annulment' },
  { zh: '神聖石', en: 'Divine Orb' },
  { zh: '崇高石', en: 'Exalted Orb' },
  { zh: '混沌石', en: 'Chaos Orb' },
  { zh: '瓦爾寶珠', en: 'Vaal Orb' },
  { zh: '機會石', en: 'Orb of Chance' },
];

export function getPoe2CanonicalBaseMappings(): BaseTypeMapping[] {
  const list = [...STATIC_BASE_MAPPINGS];

  for (let tier = 1; tier <= 16; tier++) {
    list.push({
      zh: `尋路石 (階級 ${tier})`,
      en: `Waystone (Tier ${tier})`,
    });
  }

  for (let tier = 1; tier <= 20; tier++) {
    list.push({
      zh: `未切割寶石 (階級 ${tier})`,
      en: `Uncut Gem (Tier ${tier})`,
    });
  }

  return list;
}

export function getPoe2ItemMap(): Map<string, string> {
  const map = new Map<string, string>();

  for (const { zh, en } of getPoe2CanonicalBaseMappings()) {
    map.set(zh, en);
    map.set(en, en);
  }

  // Shorthand aliases for Waystones and Uncut Gems
  for (let tier = 1; tier <= 16; tier++) {
    const en = `Waystone (Tier ${tier})`;
    map.set(`尋路石 T${tier}`, en);
    map.set(`尋路石 (T${tier})`, en);
  }

  for (let tier = 1; tier <= 20; tier++) {
    const en = `Uncut Gem (Tier ${tier})`;
    map.set(`未切割寶石 T${tier}`, en);
  }

  return map;
}
