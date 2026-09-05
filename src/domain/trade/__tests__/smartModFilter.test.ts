import { describe, it, expect } from 'vitest';
import { buildSmartDefaultMods, applyRollPercentage } from '../smartModFilter';
import type { ParsedItem, ParsedItemMod } from '../../item/types';

describe('smartModFilter', () => {
  it('selects pseudo stats and T1/T2 key mods for Rare items, while deselecting low-tier junk', () => {
    const item: ParsedItem = {
      name: '暴怒 避難所',
      baseType: '罪魔邪冠',
      rarity: 'Rare',
      language: 'zh',
      rawText: '',
      implicits: [
        {
          id: 'implicit.stat_gem_level',
          text: '此物品插槽中技能寶石等級 +2',
          englishText: '+2 to Level of Socketed Skill Gems',
          type: 'implicit',
          value: 2,
          enabled: false
        }
      ],
      explicits: [
        {
          id: 'explicit.stat_mana',
          text: '+54 最大魔力',
          englishText: '+54 to maximum Mana',
          type: 'explicit',
          tier: 5,
          value: 54,
          enabled: false
        },
        {
          id: 'explicit.stat_life',
          text: '+5 最大生命',
          englishText: '+5 to maximum Life',
          type: 'explicit',
          tier: 10,
          value: 5,
          enabled: false
        },
        {
          id: 'explicit.stat_essence',
          text: '插槽中的寶石造成 30% 更多元素傷害',
          englishText: 'Socketed Gems deal 30% more Elemental Damage',
          type: 'explicit',
          value: 30,
          enabled: false
        },
        {
          id: 'explicit.stat_lightning_res',
          text: '+30% 閃電抗性',
          englishText: '+30% to Lightning Resistance',
          type: 'explicit',
          tier: 4,
          value: 30,
          enabled: false
        },
        {
          id: 'explicit.stat_fire_res',
          text: '+22% 火焰抗性',
          englishText: '+22% to Fire Resistance',
          type: 'explicit',
          tier: 6,
          value: 22,
          enabled: false
        }
      ]
    };

    const result = buildSmartDefaultMods(item, 80);

    // Should generate and enable Pseudo Total Ele Res (+52% res * 0.8 = 41)
    const pseudoEle = result.find(m => m.id === 'pseudo.pseudo_total_elemental_resistance');
    expect(pseudoEle).toBeDefined();
    expect(pseudoEle?.enabled).toBe(true);
    expect(pseudoEle?.value).toBe(52);
    expect(pseudoEle?.minValue).toBe(41);

    // Special essence / key mod should be enabled
    const essenceMod = result.find(m => m.text.includes('更多元素傷害'));
    expect(essenceMod).toBeDefined();
    expect(essenceMod?.enabled).toBe(true);

    // Implicit gem level should be enabled (+2 gem level is high value)
    const gemMod = result.find(m => m.text.includes('寶石等級 +2'));
    expect(gemMod?.enabled).toBe(true);

    // T5 Mana, T10 Life, T4 Lightning, T6 Fire should NOT be enabled by default
    const manaMod = result.find(m => m.text.includes('最大魔力'));
    expect(manaMod?.enabled).toBe(false);

    const lifeMod = result.find(m => m.text.includes('+5 最大生命'));
    expect(lifeMod?.enabled).toBe(false);

    const lightningMod = result.find(m => m.text.includes('閃電抗性'));
    expect(lightningMod?.enabled).toBe(false);

    const fireMod = result.find(m => m.text.includes('火焰抗性'));
    expect(fireMod?.enabled).toBe(false);
  });

  it('enables T1/T2 explicit mods when tier is <= 2', () => {
    const item: ParsedItem = {
      name: 'Eagle Track',
      baseType: 'Two-Toned Boots',
      rarity: 'Rare',
      language: 'en',
      rawText: '',
      implicits: [],
      explicits: [
        {
          id: 'explicit.ms',
          text: '30% increased Movement Speed',
          englishText: '30% increased Movement Speed',
          type: 'explicit',
          tier: 1,
          value: 30,
          enabled: false
        },
        {
          id: 'explicit.suppress',
          text: '+14% chance to Suppress Spell Damage',
          englishText: '+14% chance to Suppress Spell Damage',
          type: 'explicit',
          tier: 2,
          value: 14,
          enabled: false
        },
        {
          id: 'explicit.stun',
          text: '12% increased Stun and Block Recovery',
          englishText: '12% increased Stun and Block Recovery',
          type: 'explicit',
          tier: 5,
          value: 12,
          enabled: false
        }
      ]
    };

    const result = buildSmartDefaultMods(item, 80);

    const ms = result.find(m => m.id === 'explicit.ms');
    expect(ms?.enabled).toBe(true);
    expect(ms?.minValue).toBe(24); // 30 * 0.8 = 24

    const suppress = result.find(m => m.id === 'explicit.suppress');
    expect(suppress?.enabled).toBe(true);
    expect(suppress?.minValue).toBe(11); // 14 * 0.8 = 11.2 -> 11

    const stun = result.find(m => m.id === 'explicit.stun');
    expect(stun?.enabled).toBe(false);
  });

  it('adjusts min values of active mods when roll percentage is changed', () => {
    const mods: ParsedItemMod[] = [
      {
        id: 'pseudo.pseudo_total_elemental_resistance',
        text: '+#% 總元素抗性 (Pseudo)',
        englishText: '+#% total Elemental Resistance',
        type: 'pseudo',
        value: 100,
        minValue: 80,
        enabled: true
      },
      {
        id: 'explicit.stat_ms',
        text: '增加 30% 移動速度',
        englishText: '30% increased Movement Speed',
        type: 'explicit',
        value: 30,
        minValue: 24,
        enabled: true
      },
      {
        id: 'explicit.disabled',
        text: '+20 最大魔力',
        englishText: '+20 to maximum Mana',
        type: 'explicit',
        value: 20,
        minValue: 20,
        enabled: false
      }
    ];

    const updated = applyRollPercentage(mods, 90);

    expect(updated[0].minValue).toBe(90); // 100 * 0.9 = 90
    expect(updated[1].minValue).toBe(27); // 30 * 0.9 = 27
    // Disabled mod remains unchanged or updated appropriately
  });

  it('identifies and enables PoE 2 exclusive high-value affixes by default', () => {
    const item: ParsedItem = {
      name: '風暴 結界',
      baseType: '輕靈法衣',
      rarity: 'Rare',
      language: 'zh',
      rawText: '',
      engine: 'poe2',
      spirit: 45,
      implicits: [],
      explicits: [
        {
          id: 'explicit.stat_spirit',
          text: '+45 最大精魂',
          englishText: '+45 to maximum Spirit',
          type: 'explicit',
          value: 45,
          enabled: false
        },
        {
          id: 'explicit.stat_dodge_roll_recovery_rate',
          text: '增加 20% 翻滾冷卻回復率',
          englishText: '20% increased Dodge Roll Recovery Rate',
          type: 'explicit',
          value: 20,
          enabled: false
        },
        {
          id: 'explicit.stat_rune_sockets',
          text: '+2 個符文插槽',
          englishText: '+2 Rune Sockets',
          type: 'explicit',
          value: 2,
          enabled: false
        }
      ]
    };

    const result = buildSmartDefaultMods(item, 80);

    const spiritMod = result.find(m => m.id === 'explicit.stat_spirit');
    expect(spiritMod?.enabled).toBe(true);
    expect(spiritMod?.minValue).toBe(36);

    const rollMod = result.find(m => m.id === 'explicit.stat_dodge_roll_recovery_rate');
    expect(rollMod?.enabled).toBe(true);

    const runeMod = result.find(m => m.id === 'explicit.stat_rune_sockets');
    expect(runeMod?.enabled).toBe(true);
  });
});
