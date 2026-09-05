export type WeaponSet = 'Set1' | 'Set2';
export type WeaponSlot = 'mainHand' | 'offHand';
export type WeaponCategory = 'OneHanded' | 'TwoHanded' | 'OffHand' | 'Unarmed';

export type PoE2WeaponType =
  // One-handed weapons
  | 'OneHandSword'
  | 'OneHandAxe'
  | 'OneHandMace'
  | 'Dagger'
  | 'Flail'
  | 'Wand'
  | 'Sceptre'
  | 'Spear'
  // Two-handed weapons
  | 'Bow'
  | 'Crossbow'
  | 'Staff'
  | 'Warstaff'
  | 'Quarterstaff'
  | 'TwoHandSword'
  | 'TwoHandAxe'
  | 'TwoHandMace'
  // Off-hand items
  | 'Shield'
  | 'Focus'
  | 'Quiver'
  // Special
  | 'Unarmed';

export interface EquippedWeapon {
  id: string;
  name: string;
  baseType: string;
  weaponType: PoE2WeaponType;
  category: WeaponCategory;
  isTwoHanded: boolean;
  physicalDps?: number;
  elementalDps?: number;
  totalDps?: number;
  critChance?: number;
  attacksPerSecond?: number;
  spirit?: number;
  levelRequirement?: number;
}

export interface WeaponSetConfiguration {
  mainHand: EquippedWeapon | null;
  offHand: EquippedWeapon | null;
}

export interface DualWeaponLoadout {
  set1: WeaponSetConfiguration;
  set2: WeaponSetConfiguration;
  activeSet: WeaponSet;
}

export interface SkillWeaponRequirement {
  allowedWeaponTypes?: PoE2WeaponType[];
  requiresShield?: boolean;
  requiresDualWield?: boolean;
  requiresTwoHanded?: boolean;
  disallowedWeaponTypes?: PoE2WeaponType[];
}

export type SkillBindingPreference = 'Set1' | 'Set2' | 'Auto';

export interface BoundSkill {
  id: string;
  name: string;
  gemLevel?: number;
  preference: SkillBindingPreference;
  resolvedSet: WeaponSet;
  isCompatible: boolean;
  incompatibilityReason?: string;
  requirements?: SkillWeaponRequirement;
}

export type PassiveNodeType = 'global' | 'weapon';

export interface DualSpecPassiveNode {
  id: string;
  name: string;
  type: PassiveNodeType;
  targetSet?: WeaponSet;
  statText?: string;
  stats?: Record<string, number>;
}

export interface DualSpecAllocation {
  characterLevel: number;
  maxGlobalPoints: number;
  allocatedGlobalPoints: number;
  maxWeaponPoints: number;
  allocatedSet1WeaponPoints: number;
  allocatedSet2WeaponPoints: number;
  globalNodes: DualSpecPassiveNode[];
  set1Nodes: DualSpecPassiveNode[];
  set2Nodes: DualSpecPassiveNode[];
}

export interface DualSpecValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    globalPointsRemaining: number;
    set1PointsRemaining: number;
    set2PointsRemaining: number;
  };
}
