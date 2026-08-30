import { POE_TERMS_DICTIONARY } from './atlasTermsDictionary';

export function translatePhrase(str: string): string {
  let res = str.replace(/\[(?:[^|\]]+\|)?([^\]]+)\]/g, '$1').replace(/\s+/g, ' ').trim();
  for (const [pattern, replacement] of POE_TERMS_DICTIONARY) {
    res = res.replace(pattern, replacement);
  }
  return res;
}

export interface StatPatternRule {
  pattern: RegExp;
  replace: (substring: string, ...args: string[]) => string;
}

export const STAT_PATTERN_RULES: StatPatternRule[] = [
  // 1. Special Passives & Modifiers
  { pattern: /^Grants (\d+) Atlas Passive Skill Points$/i, replace: (_, v) => `獲得 ${v} 點輿圖天賦點數` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*reduced Cost of Building and Upgrading Towers$/i, replace: (_, v) => `建造與升級防禦塔的消耗減少 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*reduced chance for Memory Threads to lead towards the (.*)$/i, replace: (_, v, target) => `記憶絲線通往 ${translatePhrase(target)} 的機率減少 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased chance for your Maps to contain Memory Tears(.*)$/i, replace: (_, v, extra) => `你的地圖包含記憶淚滴的機率增加 ${v}${extra ? ` (${translatePhrase(extra)})` : ''}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased chance for Maps found in your Maps to have Memory Influence$/i, replace: (_, v) => `在地圖中找到的地圖有記憶勢力影響的機率增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased chance for Equipment Items dropped in your Maps to have Memory Strands$/i, replace: (_, v) => `在地圖中掉落的裝備具有記憶絲線的機率增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for Wild Rogue Exiles in your Maps to appear in Pairs$/i, replace: (_, v) => `地圖中的野生流亡者有 ${v} 機率成對出現` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance on defeating Mercenaries found in your Maps for them to drop all their Items$/i, replace: (_, v) => `擊敗地圖中的傭兵時有 ${v} 機率掉落其所有物品` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased chance for Mercenaries found in your Maps to be Infamous$/i, replace: (_, v) => `在地圖中找到的傭兵為惡名昭彰的機率增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased chance for Items worn by Mercenaries found in Maps to be Unique$/i, replace: (_, v) => `地圖中傭兵穿戴的物品為傳奇物品的機率增加 ${v}` },

  // 2. Scarabs
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Scarabs found in your Maps$/i, replace: (_, v) => `在地圖中找到的聖甲蟲增加 ${v}` },
  { pattern: /^Scarabs dropped in your Maps have (\+?\d+(?:\.\d+)?%?)\s*increased chance to be (.*)$/i, replace: (_, v, t) => `地圖中掉落的聖甲蟲有 ${v} 增加機率為 ${translatePhrase(t)}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased chance for Scarabs found in your Maps to be (.*)$/i, replace: (_, v, t) => `地圖中找到的聖甲蟲為 ${translatePhrase(t)} 的機率增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased chance for Scarabs dropped in your Maps to be (.*)$/i, replace: (_, v, t) => `地圖中掉落的聖甲蟲為 ${translatePhrase(t)} 的機率增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for Scarabs dropped in your Maps to be Duplicated$/i, replace: (_, v) => `地圖中掉落的聖甲蟲有 ${v} 機率被複製` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased effect of Scarabs on your Maps$/i, replace: (_, v) => `地圖上的聖甲蟲效果增加 ${v}` },

  // 3. Map Magnitudes, Quant, Rarity, Pack size, Lifeforce
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased effect of Modifiers on your Non-Unique Maps$/i, replace: (_, v) => `非傳奇地圖詞綴效果增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased effect of Modifiers on your Maps$/i, replace: (_, v) => `地圖詞綴效果增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Explicit Modifier magnitudes on your Maps$/i, replace: (_, v) => `地圖顯性前綴與後綴詞綴效果增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased effect of Explicit Modifiers on your Maps per Explicit Modifier$/i, replace: (_, v) => `地圖顯性詞綴效果增加 ${v} (每條顯性詞綴)` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased effect of Explicit Modifiers on your Maps$/i, replace: (_, v) => `地圖顯性詞綴效果增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Quantity of Items found in your Maps$/i, replace: (_, v) => `地圖掉落物品數量增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Rarity of Items found in your Maps$/i, replace: (_, v) => `地圖掉落物品稀有度增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Monster Pack Size in your Maps$/i, replace: (_, v) => `地圖怪物群規模增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Quantity of Lifeforce dropped by Harvest Monsters in your Maps$/i, replace: (_, v) => `地圖中莊園怪物掉落的命能數量增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Quantity of Lifeforce dropped by Harvest Monsters$/i, replace: (_, v) => `莊園怪物掉落的命能數量增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Quantity of Wombgifts found in your Maps$/i, replace: (_, v) => `地圖中找到的胎囊贈禮數量增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Quantity of Items contained in Strongboxes in your Maps$/i, replace: (_, v) => `地圖中保險箱內包含的物品數量增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Quantity of Timeless Splinters dropped by Legion Generals in your Maps$/i, replace: (_, v) => `地圖中軍團將軍掉落的永恆碎片數量增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased quantity of Abyss Jewels found in your Maps$/i, replace: (_, v) => `地圖中找到的深淵珠寶數量增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased number of Magic Monsters in your Maps$/i, replace: (_, v) => `地圖中魔法怪物數量增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased number of Rare Monsters in your Maps$/i, replace: (_, v) => `地圖中稀有怪物數量增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Maps found in your Maps$/i, replace: (_, v) => `在地圖中找到的地圖增加 ${v}` },

  // 4. Boss & Map Drops
  { pattern: /^Maps found in your Maps have (\+?\d+(?:\.\d+)?%?)\s*chance to be 1 tier higher$/i, replace: (_, v) => `在地圖中找到的地圖有 ${v} 機率階級提升 1 階` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for a Tier 1-15 Map to drop as a Tier higher$/i, replace: (_, v) => `掉落的 T1-15 地圖提升 1 個階級機率 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for a connected Map to drop from Unique Boss$/i, replace: (_, v) => `傳奇首領掉落相連地圖機率 ${v}` },
  { pattern: /^Map Bosses have (\+?\d+(?:\.\d+)?%?)\s*chance to drop an additional connected Map$/i, replace: (_, v) => `地圖首領有 ${v} 機率掉落額外相連地圖` },
  { pattern: /^Final Map Boss in each Map has (\+?\d+(?:\.\d+)?%?)\s*chance to drop an additional (.*)$/i, replace: (_, v, it) => `地圖最終首領有 ${v} 機率額外掉落 ${translatePhrase(it)}` },
  { pattern: /^Final Map Boss in each Map has (\+?\d+(?:\.\d+)?%?)\s*chance to (.*)$/i, replace: (_, v, act) => `地圖最終首領有 ${v} 機率 ${translatePhrase(act)}` },
  { pattern: /^Map Bosses have (\+?\d+(?:\.\d+)?%?)\s*chance to (.*)$/i, replace: (_, v, act) => `地圖首領有 ${v} 機率 ${translatePhrase(act)}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for a Synthesis Map to drop from Final Map Boss(.*)$/i, replace: (_, v, extra) => `最終首領掉落憶境地圖機率 ${v}${extra ? ` (${translatePhrase(extra)})` : ''}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for a Shaper Guardian Map to drop from Final Map Boss(.*)$/i, replace: (_, v, extra) => `最終首領掉落塑界守護者地圖機率 ${v}${extra ? ` (${translatePhrase(extra)})` : ''}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for an Elder Guardian Map to drop from Final Map Boss(.*)$/i, replace: (_, v, extra) => `最終首領掉落尊師守護者地圖機率 ${v}${extra ? ` (${translatePhrase(extra)})` : ''}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for a Conqueror Map to drop from Final Map Boss(.*)$/i, replace: (_, v, extra) => `最終首領掉落征服者地圖機率 ${v}${extra ? ` (${translatePhrase(extra)})` : ''}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance on Completing a Map to gain a free Kirac Mission$/i, replace: (_, v) => `完成地圖時獲得基拉克任務機率 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased chance for Bosses Witnessed by the Maven in your Maps to drop Maven Chisels$/i, replace: (_, v) => `地圖中由使徒(Maven)見證的首領掉落使徒之釘的機率增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for your Maps to attract Beyond Demons$/i, replace: (_, v) => `你的地圖有 ${v} 機率吸引超越惡魔` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Stack size of Simulacrum Splinters found in your Maps$/i, replace: (_, v) => `地圖中找到的幻像異界碎片堆疊數量增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Explosive Placement Range in your Maps$/i, replace: (_, v) => `地圖中炸藥放置範圍增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased chance for Legion Encounters in your Maps to include a General$/i, replace: (_, v) => `地圖中的軍團遭遇包含一名將軍的機率增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased chance to find Eater of Worlds Altars in your Maps$/i, replace: (_, v) => `在地圖中找到滅界者祭壇的機率增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased chance to find Searing Exarch Altars in your Maps$/i, replace: (_, v) => `在地圖中找到灼烙總督祭壇的機率增加 ${v}` },

  // 5. Settlers & Ores
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased chance for Ore Deposits found in your Maps to be (.*)$/i, replace: (_, v, t) => `地圖中找到的礦石礦脈為 ${translatePhrase(t)} 的機率增加 ${v}` },
  { pattern: /^Ore Deposits in your Maps have (\+?\d+(?:\.\d+)?%?)\s*increased chance to be (.*)$/i, replace: (_, v, t) => `地圖中的礦石礦脈有 ${v} 增加機率為 ${translatePhrase(t)}` },
  { pattern: /^Ore Deposits in your Maps are more likely to be rarer varieties$/i, replace: () => `地圖中的礦石礦脈更有可能為稀有種類` },
  { pattern: /^Your Maps with Ore Deposits have (\+?\d+(?:\.\d+)?%?)\s*increased chance\s*to contain at least two Ore Deposits$/i, replace: (_, v) => `含有礦石礦脈的地圖有 ${v} 增加機率包含至少 2 個礦石礦脈` },
  { pattern: /^Wombgifts found in your Maps have (\+?\d+(?:\.\d+)?%?)\s*increased chance to be (.*)$/i, replace: (_, v, t) => `地圖中找到的胎囊贈禮有 ${v} 增加機率為 ${translatePhrase(t)}` },

  // 6. Mechanics Encounter & General Entities
  { pattern: /^Your Maps have (\+?\d+(?:\.\d+)?%?)\s*chance to contain an? (.*) Encounter$/i, replace: (_, v, t) => `你的地圖有 ${v} 機率包含 ${translatePhrase(t)} 遭遇` },
  { pattern: /^Your Maps have (\+?\d+(?:\.\d+)?%?)\s*chance to contain an? (.*)$/i, replace: (_, v, t) => `你的地圖有 ${v} 機率包含 ${translatePhrase(t)}` },
  { pattern: /^Your Maps have (\+?\d+(?:\.\d+)?%?)\s*increased chance to contain an? (.*)$/i, replace: (_, v, t) => `你的地圖包含 ${translatePhrase(t)} 的機率增加 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for an? (.*)$/i, replace: (_, v, t) => `區域含有 ${translatePhrase(t)} 機率 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance in Areas to contain (.*)$/i, replace: (_, v, t) => `區域含有 ${translatePhrase(t)} 機率 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for Maps to contain an? (.*)$/i, replace: (_, v, t) => `地圖含有 ${translatePhrase(t)} 機率 ${v}` },
  { pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for Timeless Splinters to drop as Timeless Emblems instead in your Maps$/i, replace: (_, v) => `地圖中掉落的永恆碎片有 ${v} 機率直接轉為永恆徽章` },
  { pattern: /^1 Lane of Blight Encounters in your Maps is guarded only by Blight Bosses$/i, replace: () => `地圖中枯萎遭遇的 1 條路徑僅由枯萎首領守衛` },
  { pattern: /^Varieties of Items contained in (\d+) Blight Chests? in your Maps are Lucky$/i, replace: (_, v) => `地圖中 ${v} 個枯萎寶箱包含的物品種類為幸運` },
  { pattern: /^Imprisoned Monsters in your Maps have (\+?\d+(?:\.\d+)?%?)\s*chance to (.*)$/i, replace: (_, v, act) => `地圖中被禁錮的怪物有 ${v} 機率 ${translatePhrase(act)}` },
  { pattern: /^Strongboxes in your Maps have (\+?\d+(?:\.\d+)?%?)\s*chance to (.*)$/i, replace: (_, v, act) => `地圖中的保險箱有 ${v} 機率 ${translatePhrase(act)}` },
  { pattern: /^Harvest Monsters in your Maps have (\+?\d+(?:\.\d+)?%?)\s*chance to (.*)$/i, replace: (_, v, act) => `地圖中的莊園怪物有 ${v} 機率 ${translatePhrase(act)}` },
  { pattern: /^Ritual Altars in your Maps have (\+?\d+(?:\.\d+)?%?)\s*(.*)$/i, replace: (_, v, act) => `地圖中的祭祀神壇有 ${v} ${translatePhrase(act)}` },
  { pattern: /^Blight Chests in your Maps have (\+?\d+(?:\.\d+)?%?)\s*(?:chance to|more chance to)\s*(.*)$/i, replace: (_, v, act) => `地圖中的枯萎寶箱有 ${v} 機率 ${translatePhrase(act)}` },
  { pattern: /^Breaches in your Maps have (\+?\d+(?:\.\d+)?%?)\s*(.*)$/i, replace: (_, v, act) => `地圖中的裂痕有 ${v} ${translatePhrase(act)}` },
  { pattern: /^Beyond Portals in your Maps have (\+?\d+(?:\.\d+)?%?)\s*(.*)$/i, replace: (_, v, act) => `地圖中的超越傳送門有 ${v} ${translatePhrase(act)}` },
  { pattern: /^Delirious Monsters in your Maps have (\+?\d+(?:\.\d+)?%?)\s*(.*)$/i, replace: (_, v, act) => `地圖中的譫妄怪物有 ${v} ${translatePhrase(act)}` },
  { pattern: /^Ultimatum Encounters in your Maps have (\+?\d+(?:\.\d+)?%?)\s*(.*)$/i, replace: (_, v, act) => `地圖中的最後通牒遭遇有 ${v} ${translatePhrase(act)}` },
  { pattern: /^Ultimatum Stone Circles in your Maps have (\+?\d+(?:\.\d+)?%?)\s*increased radius$/i, replace: (_, v) => `地圖中的最後通牒石圈範圍增加 ${v}` }
];
