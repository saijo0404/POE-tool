import type { ParsedItem } from '../../item/types';

export const mockItemA: ParsedItem = {
  name: '暴怒 避難所',
  baseType: '罪魔邪冠',
  rarity: 'Rare',
  itemLevel: 85,
  language: 'zh',
  rawText: 'Item A text',
  implicits: [],
  explicits: [
    {
      id: '1',
      text: '+54 最大魔力',
      englishText: '+54 to maximum Mana',
      type: 'explicit',
      value: 54,
      enabled: true
    },
    {
      id: '2',
      text: '+30% 閃電抗性',
      englishText: '+30% to Lightning Resistance',
      type: 'explicit',
      value: 30,
      enabled: true
    }
  ]
};

export const mockItemB: ParsedItem = {
  name: '恐懼 之靈',
  baseType: '罪魔邪冠',
  rarity: 'Rare',
  itemLevel: 80,
  language: 'zh',
  rawText: 'Item B text',
  implicits: [],
  explicits: [
    {
      id: '3',
      text: '+80 最大魔力',
      englishText: '+80 to maximum Mana',
      type: 'explicit',
      value: 80,
      enabled: true
    },
    {
      id: '4',
      text: '+45% 火焰抗性',
      englishText: '+45% to Fire Resistance',
      type: 'explicit',
      value: 45,
      enabled: true
    }
  ]
};

export const mockItemC: ParsedItem = {
  name: '勝利 榮耀',
  baseType: '罪魔邪冠',
  rarity: 'Rare',
  itemLevel: 88,
  language: 'zh',
  rawText: 'Item C text',
  implicits: [],
  explicits: [
    {
      id: '5',
      text: '+20% 閃電抗性',
      englishText: '+20% to Lightning Resistance',
      type: 'explicit',
      value: 20,
      enabled: true
    }
  ]
};
