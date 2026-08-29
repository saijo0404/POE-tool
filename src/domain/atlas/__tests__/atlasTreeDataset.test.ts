import { describe, it, expect } from 'vitest';
import { ATLAS_TREE_NODES_DATA, ATLAS_NODES_MAP } from '../atlasTreeDataset';

describe('atlasTreeDataset', () => {
  it('contains over 800 valid official nodes with unique id and numId', () => {
    expect(ATLAS_TREE_NODES_DATA.length).toBeGreaterThan(800);

    const idSet = new Set<string>();
    const numIdSet = new Set<number>();

    ATLAS_TREE_NODES_DATA.forEach(node => {
      expect(node.id).toBeTruthy();
      expect(node.numId).toBeGreaterThan(0);
      expect(idSet.has(node.id)).toBe(false);
      expect(numIdSet.has(node.numId)).toBe(false);

      idSet.add(node.id);
      numIdSet.add(node.numId);
    });
  });

  it('contains valid node coordinates and types', () => {
    ATLAS_TREE_NODES_DATA.forEach(node => {
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
      expect(['start', 'keystone', 'notable', 'small']).toContain(node.type);
    });
  });

  it('has valid connections pointing to existing nodes', () => {
    ATLAS_TREE_NODES_DATA.forEach(node => {
      node.connections.forEach(targetId => {
        expect(ATLAS_NODES_MAP[targetId]).toBeDefined();
      });
    });
  });

  it('covers major PoE 1 mechanics and keystones', () => {
    const categories = new Set(ATLAS_TREE_NODES_DATA.map(n => n.category));
    expect(categories.has('essence')).toBe(true);
    expect(categories.has('ambush')).toBe(true);
    expect(categories.has('harvest')).toBe(true);
    expect(categories.has('expedition')).toBe(true);
    expect(categories.has('legion')).toBe(true);
    expect(categories.has('delirium')).toBe(true);
    expect(categories.has('boss')).toBe(true);
    expect(categories.has('map')).toBe(true);
    expect(categories.has('scarab')).toBe(true);

    const keystones = ATLAS_TREE_NODES_DATA.filter(n => n.type === 'keystone');
    expect(keystones.length).toBeGreaterThanOrEqual(20);
  });
});
