import { describe, it, expect } from 'vitest';
import {
  calculateAvailablePoints,
  validateDualSpecAllocation
} from '../dualSpecValidator';
import type { DualSpecAllocation } from '../types';

describe('dualSpecValidator', () => {
  it('calculates available points from character level and quest rewards', () => {
    // Level 100 character with standard 24 quest global points and 24 weapon points
    const pts100 = calculateAvailablePoints(100, 24, 24);
    expect(pts100.maxGlobal).toBe(99 + 24); // 123
    expect(pts100.maxWeapon).toBe(24);

    // Level 1 character
    const pts1 = calculateAvailablePoints(1, 0, 0);
    expect(pts1.maxGlobal).toBe(0);
    expect(pts1.maxWeapon).toBe(0);
  });

  it('validates successful allocation when points and node types are compliant', () => {
    const validAllocation: DualSpecAllocation = {
      characterLevel: 90,
      maxGlobalPoints: 113,
      allocatedGlobalPoints: 80,
      maxWeaponPoints: 24,
      allocatedSet1WeaponPoints: 20,
      allocatedSet2WeaponPoints: 24,
      globalNodes: [
        { id: 'g1', name: 'Maximum Life', type: 'global' },
        { id: 'g2', name: 'Movement Speed', type: 'global' }
      ],
      set1Nodes: [
        { id: 'w1', name: 'Bow Physical Damage', type: 'weapon', targetSet: 'Set1' }
      ],
      set2Nodes: [
        { id: 'w2', name: 'Spell Damage & Cast Speed', type: 'weapon', targetSet: 'Set2' }
      ]
    };

    const result = validateDualSpecAllocation(validAllocation);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.stats.globalPointsRemaining).toBe(33);
    expect(result.stats.set1PointsRemaining).toBe(4);
    expect(result.stats.set2PointsRemaining).toBe(0);
  });

  it('detects exceeded points errors', () => {
    const overAllocated: DualSpecAllocation = {
      characterLevel: 50,
      maxGlobalPoints: 73,
      allocatedGlobalPoints: 80, // Exceeded!
      maxWeaponPoints: 24,
      allocatedSet1WeaponPoints: 30, // Exceeded!
      allocatedSet2WeaponPoints: 20,
      globalNodes: [],
      set1Nodes: [],
      set2Nodes: []
    };

    const result = validateDualSpecAllocation(overAllocated);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('全域天賦點數超額'))).toBe(true);
    expect(result.errors.some(e => e.includes('武器組 1 專屬點數超額'))).toBe(true);
  });

  it('detects negative points errors', () => {
    const negativeAllocation: DualSpecAllocation = {
      characterLevel: 50,
      maxGlobalPoints: 73,
      allocatedGlobalPoints: -5,
      maxWeaponPoints: 24,
      allocatedSet1WeaponPoints: 10,
      allocatedSet2WeaponPoints: -2,
      globalNodes: [],
      set1Nodes: [],
      set2Nodes: []
    };

    const result = validateDualSpecAllocation(negativeAllocation);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('全域天賦點數不可為負數'))).toBe(true);
    expect(result.errors.some(e => e.includes('武器組專屬點數不可為負數'))).toBe(true);
  });

  it('validates node types and target sets consistency', () => {
    const mismatchedNodes: DualSpecAllocation = {
      characterLevel: 90,
      maxGlobalPoints: 113,
      allocatedGlobalPoints: 10,
      maxWeaponPoints: 24,
      allocatedSet1WeaponPoints: 10,
      allocatedSet2WeaponPoints: 10,
      globalNodes: [
        // Error: weapon node inside globalNodes
        { id: 'bad1', name: 'Weapon Node In Global', type: 'weapon' }
      ],
      set1Nodes: [
        // Error: targetSet is Set2 but node is inside set1Nodes
        { id: 'bad2', name: 'Set 2 Node In Set 1', type: 'weapon', targetSet: 'Set2' }
      ],
      set2Nodes: []
    };

    const result = validateDualSpecAllocation(mismatchedNodes);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('全域天賦 節點 "Weapon Node In Global" 型別錯誤'))).toBe(true);
    expect(result.errors.some(e => e.includes('武器組 1 節點 "Set 2 Node In Set 1" 指向錯誤的武器組'))).toBe(true);
  });

  it('emits warnings for duplicate node IDs', () => {
    const duplicateNodes: DualSpecAllocation = {
      characterLevel: 90,
      maxGlobalPoints: 113,
      allocatedGlobalPoints: 10,
      maxWeaponPoints: 24,
      allocatedSet1WeaponPoints: 10,
      allocatedSet2WeaponPoints: 10,
      globalNodes: [
        { id: 'dup_node', name: 'Node 1', type: 'global' },
        { id: 'dup_node', name: 'Node 1 Duplicate', type: 'global' }
      ],
      set1Nodes: [],
      set2Nodes: []
    };

    const result = validateDualSpecAllocation(duplicateNodes);
    expect(result.warnings.some(w => w.includes('重複的天賦節點 ID: dup_node'))).toBe(true);
  });
});
