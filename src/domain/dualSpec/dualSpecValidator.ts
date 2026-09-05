import type { DualSpecAllocation, DualSpecValidationResult } from './types';

export function calculateAvailablePoints(
  characterLevel: number,
  questGlobal = 24,
  questWeapon = 24
): { maxGlobal: number; maxWeapon: number } {
  const safeLevel = Math.max(1, Math.min(100, Math.floor(characterLevel)));
  const maxGlobal = safeLevel - 1 + Math.max(0, questGlobal);
  const maxWeapon = Math.max(0, questWeapon);
  return { maxGlobal, maxWeapon };
}

export function validateDualSpecAllocation(
  allocation: DualSpecAllocation
): DualSpecValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Point limit validation
  if (allocation.allocatedGlobalPoints > allocation.maxGlobalPoints) {
    errors.push(
      `全域天賦點數超額: 已分配 ${allocation.allocatedGlobalPoints} / 上限 ${allocation.maxGlobalPoints}`
    );
  }
  if (allocation.allocatedSet1WeaponPoints > allocation.maxWeaponPoints) {
    errors.push(
      `武器組 1 專屬點數超額: 已分配 ${allocation.allocatedSet1WeaponPoints} / 上限 ${allocation.maxWeaponPoints}`
    );
  }
  if (allocation.allocatedSet2WeaponPoints > allocation.maxWeaponPoints) {
    errors.push(
      `武器組 2 專屬點數超額: 已分配 ${allocation.allocatedSet2WeaponPoints} / 上限 ${allocation.maxWeaponPoints}`
    );
  }

  // Negative points validation
  if (allocation.allocatedGlobalPoints < 0) {
    errors.push('全域天賦點數不可為負數');
  }
  if (allocation.allocatedSet1WeaponPoints < 0 || allocation.allocatedSet2WeaponPoints < 0) {
    errors.push('武器組專屬點數不可為負數');
  }

  // Node array consistency checks
  validateNodeList(allocation.globalNodes, '全域天賦', 'global', errors, warnings);
  validateNodeList(allocation.set1Nodes, '武器組 1', 'weapon', errors, warnings, 'Set1');
  validateNodeList(allocation.set2Nodes, '武器組 2', 'weapon', errors, warnings, 'Set2');

  const globalPointsRemaining = Math.max(0, allocation.maxGlobalPoints - allocation.allocatedGlobalPoints);
  const set1PointsRemaining = Math.max(0, allocation.maxWeaponPoints - allocation.allocatedSet1WeaponPoints);
  const set2PointsRemaining = Math.max(0, allocation.maxWeaponPoints - allocation.allocatedSet2WeaponPoints);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      globalPointsRemaining,
      set1PointsRemaining,
      set2PointsRemaining
    }
  };
}

function validateNodeList(
  nodes: import('./types').DualSpecPassiveNode[],
  listName: string,
  expectedType: import('./types').PassiveNodeType,
  errors: string[],
  warnings: string[],
  expectedSet?: import('./types').WeaponSet
): void {
  const idSet = new Set<string>();

  for (const node of nodes) {
    if (idSet.has(node.id)) {
      warnings.push(`${listName} 中包含重複的天賦節點 ID: ${node.id}`);
    }
    idSet.add(node.id);

    if (node.type !== expectedType) {
      errors.push(
        `${listName} 節點 "${node.name}" 型別錯誤: 預期 ${expectedType}，實際為 ${node.type}`
      );
    }

    if (expectedSet && node.targetSet && node.targetSet !== expectedSet) {
      errors.push(
        `${listName} 節點 "${node.name}" 指向錯誤的武器組: 預期 ${expectedSet}，實際為 ${node.targetSet}`
      );
    }
  }
}
