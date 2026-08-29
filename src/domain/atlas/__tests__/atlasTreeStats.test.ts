import { describe, it, expect } from 'vitest';
import { calculateAtlasTreeStats, translateStatToZh } from '../atlasTreeStats';
import { ATLAS_TREE_NODES_DATA } from '../atlasTreeDataset';
import type { AtlasNode } from '../types';

describe('atlasTreeStats', () => {
  it('calculates points spent excluding start node 29045 and start_origin', () => {
    // Allocating only origin start node costs 0 points
    const originOnly = new Set(['29045']);
    const statsOrigin = calculateAtlasTreeStats(originOnly, ATLAS_TREE_NODES_DATA);
    expect(statsOrigin.pointsSpent).toBe(0);

    // Allocating origin + 2 real nodes costs exactly 2 points
    const nonStartNodes = ATLAS_TREE_NODES_DATA.filter(n => n.type !== 'start');
    const allocated = new Set(['29045', nonStartNodes[0].id, nonStartNodes[1].id]);
    const stats = calculateAtlasTreeStats(allocated, ATLAS_TREE_NODES_DATA);

    expect(stats.pointsSpent).toBe(2);
  });

  it('aggregates active keystones and stats list', () => {
    const keystone = ATLAS_TREE_NODES_DATA.find(n => n.type === 'keystone')!;
    const allocated = new Set(['29045', keystone.id]);
    const stats = calculateAtlasTreeStats(allocated, ATLAS_TREE_NODES_DATA);

    expect(stats.activeKeystones.length).toBe(1);
    expect(stats.activeKeystones[0].id).toBe(keystone.id);
  });

  it('correctly aggregates duplicate numeric stats into summed values with counts', () => {
    const mockNodes: AtlasNode[] = [
      {
        id: '29045',
        numId: 29045,
        name: '輿圖起點',
        nameEn: 'Atlas Origin',
        type: 'start',
        category: 'general',
        description: '',
        stats: ['輿圖探索起點'],
        x: 0,
        y: 0,
        connections: ['n1', 'n2']
      },
      {
        id: 'n1',
        numId: 101,
        name: '聖甲蟲掉落 1',
        nameEn: 'Scarab Drop 1',
        type: 'small',
        category: 'scarab',
        description: '',
        stats: ['4% increased Scarabs found in your Maps'],
        x: 10,
        y: 10,
        connections: ['29045', 'n2']
      },
      {
        id: 'n2',
        numId: 102,
        name: '聖甲蟲掉落 2',
        nameEn: 'Scarab Drop 2',
        type: 'small',
        category: 'scarab',
        description: '',
        stats: ['4% increased Scarabs found in your Maps'],
        x: 20,
        y: 20,
        connections: ['n1']
      }
    ];

    const stats = calculateAtlasTreeStats(new Set(['29045', 'n1', 'n2']), mockNodes);
    expect(stats.pointsSpent).toBe(2);
    expect(stats.aggregatedStats.length).toBe(1);
    expect(stats.aggregatedStats[0].count).toBe(2);
    expect(stats.aggregatedStats[0].totalValue).toBe(8);
    expect(stats.aggregatedStats[0].textEn).toContain('8% increased Scarabs found in your Maps (2 nodes)');
    expect(stats.aggregatedStats[0].text).toContain('在地圖中找到的聖甲蟲增加 8% (2 個節點)');
  });

  it('translates common atlas passives to Traditional Chinese', () => {
    const en1 = '10% chance for Maps to contain an Essence';
    expect(translateStatToZh(en1)).toContain('區域含有精髓機率 10%');

    const en2 = '10% increased quantity of Lifeforce dropped by Harvest Monsters in your Maps';
    expect(translateStatToZh(en2)).toContain('地圖中莊園怪物掉落的命能數量增加 10%');

    const en3 = 'Strongboxes in your Maps have 6% chance to be an additional Diviner\'s Strongbox';
    expect(translateStatToZh(en3)).toContain('地圖中的保險箱有 6% 機率');
    expect(translateStatToZh(en3)).toContain('命運卡保險箱');

    const en4 = 'Maps found in your Maps have 2% chance to be 1 tier higher';
    expect(translateStatToZh(en4)).toContain('在地圖中找到的地圖有 2% 機率階級提升 1 階');

    const en5 = 'Your Maps have +8% chance to contain a Legion Encounter';
    expect(translateStatToZh(en5)).toContain('你的地圖有 +8% 機率包含 軍團 遭遇');

    const en6 = '15% increased chance for [ContainsAbyss|Abysses] in your Maps to spawn';
    expect(translateStatToZh(en6)).toContain('深淵');
  });
});


