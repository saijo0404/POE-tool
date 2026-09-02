import { describe, it, expect } from 'vitest';
import { evaluateMapDanger, isMapItem } from '../dangerEvaluator';
import { DEFAULT_MAP_DANGER_CONFIG } from '../dangerPresets';
import type { ParsedItem } from '../../item/types';

describe('Map Danger Evaluator', () => {
  const sampleNonMapItem: ParsedItem = {
    name: 'Headhunter',
    baseType: 'Leather Belt',
    rarity: 'Unique',
    itemClass: 'Belts',
    language: 'en',
    implicits: [{ id: '1', text: '+40 to maximum Life', englishText: '+40 to maximum Life', type: 'implicit', enabled: true }],
    explicits: [{ id: '2', text: 'When you Kill a Rare Monster, you gain its Modifiers for 60 seconds', englishText: '...', type: 'explicit', enabled: true }],
    rawText: 'Rarity: Unique\nHeadhunter\nLeather Belt\n--------\n...'
  };

  const sampleZhDangerousMap: ParsedItem = {
    name: '劇毒林地',
    baseType: '劇毒林地',
    rarity: 'Rare',
    itemClass: '地圖',
    language: 'zh',
    implicits: [],
    explicits: [
      { id: '1', text: '怪物的攻擊與法術附加 85% 物理傷害的火焰傷害', englishText: 'Monsters deal 85% extra Phys as Fire', type: 'explicit', enabled: true },
      { id: '2', text: '怪物反射 18% 元素傷害', englishText: 'Monsters reflect 18% of Elemental Damage', type: 'explicit', enabled: true },
      { id: '3', text: '玩家無法回復生命、魔力或能量護盾', englishText: 'Players cannot Regenerate Life, Mana or Energy Shield', type: 'explicit', enabled: true },
      { id: '4', text: '怪群規模 +28%', englishText: '+28% Monster Pack Size', type: 'explicit', enabled: true }
    ],
    rawText: '物品種類: 地圖\n稀有度: 稀有\n劇毒林地\n--------\n地圖階級: 16\n--------\n怪物反射 18% 元素傷害\n玩家無法回復生命、魔力或能量護盾\n怪群規模 +28%'
  };

  const sampleEnDangerousMap: ParsedItem = {
    name: 'Toxic Sewer Map',
    baseType: 'Toxic Sewer Map',
    rarity: 'Rare',
    itemClass: 'Maps',
    language: 'en',
    implicits: [],
    explicits: [
      { id: '1', text: 'Monsters reflect 18% of Physical Damage', englishText: 'Monsters reflect 18% of Physical Damage', type: 'explicit', enabled: true },
      { id: '2', text: 'Players have -12% to all maximum Resistances', englishText: 'Players have -12% to all maximum Resistances', type: 'explicit', enabled: true }
    ],
    rawText: 'Item Class: Maps\nRarity: Rare\nToxic Sewer Map\n--------\nMap Tier: 16\n--------\nMonsters reflect 18% of Physical Damage\nPlayers have -12% to all maximum Resistances'
  };

  it('should identify whether an item or text is a map', () => {
    expect(isMapItem(sampleNonMapItem)).toBe(false);
    expect(isMapItem(sampleZhDangerousMap)).toBe(true);
    expect(isMapItem(sampleEnDangerousMap)).toBe(true);
    expect(isMapItem('Item Class: Maps\nMap Tier: 14')).toBe(true);
    expect(isMapItem('物品種類: 地圖\n地圖階級: 16')).toBe(true);
    expect(isMapItem('Rarity: Rare\nGold Ring')).toBe(false);
  });

  it('should detect Chinese dangerous map mods correctly', () => {
    const evalResult = evaluateMapDanger(sampleZhDangerousMap, DEFAULT_MAP_DANGER_CONFIG);
    expect(evalResult.isMap).toBe(true);
    expect(evalResult.hasDanger).toBe(true);
    expect(evalResult.matchedDangerMods.length).toBe(2);

    const modIds = evalResult.matchedDangerMods.map(m => m.def.id);
    expect(modIds).toContain('ele_reflect');
    expect(modIds).toContain('no_regen');
    expect(evalResult.dangerScore).toBeGreaterThan(0);
  });

  it('should detect English dangerous map mods correctly', () => {
    const evalResult = evaluateMapDanger(sampleEnDangerousMap, DEFAULT_MAP_DANGER_CONFIG);
    expect(evalResult.isMap).toBe(true);
    expect(evalResult.hasDanger).toBe(true);
    expect(evalResult.matchedDangerMods.length).toBe(2);

    const modIds = evalResult.matchedDangerMods.map(m => m.def.id);
    expect(modIds).toContain('phys_reflect');
    expect(modIds).toContain('minus_max_res');
  });

  it('should respect custom keywords configured by user', () => {
    const customConfig = {
      ...DEFAULT_MAP_DANGER_CONFIG,
      blacklistedModIds: [],
      customKeywords: ['怪群規模', 'toxic']
    };
    const evalResult = evaluateMapDanger(sampleZhDangerousMap, customConfig);
    expect(evalResult.hasDanger).toBe(true);
    expect(evalResult.matchedCustomKeywords).toContain('怪群規模');
  });

  it('should return safe evaluation for clean maps or non-maps', () => {
    const nonMapResult = evaluateMapDanger(sampleNonMapItem, DEFAULT_MAP_DANGER_CONFIG);
    expect(nonMapResult.isMap).toBe(false);
    expect(nonMapResult.hasDanger).toBe(false);

    const safeMap: ParsedItem = {
      name: 'Safe Map',
      baseType: 'Dunes Map',
      rarity: 'Rare',
      itemClass: 'Maps',
      language: 'en',
      implicits: [],
      explicits: [{ id: '1', text: '+30% Monster Pack Size', englishText: '+30% Monster Pack Size', type: 'explicit', enabled: true }],
      rawText: 'Item Class: Maps\nMap Tier: 16\n--------\n+30% Monster Pack Size'
    };
    const safeResult = evaluateMapDanger(safeMap, DEFAULT_MAP_DANGER_CONFIG);
    expect(safeResult.isMap).toBe(true);
    expect(safeResult.hasDanger).toBe(false);
    expect(safeResult.matchedDangerMods).toHaveLength(0);
  });
});
