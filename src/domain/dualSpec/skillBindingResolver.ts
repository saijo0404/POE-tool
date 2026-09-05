import type {
  BoundSkill,
  DualWeaponLoadout,
  PoE2WeaponType,
  SkillWeaponRequirement,
  WeaponSetConfiguration
} from './types';

export function checkSkillCompatibility(
  skill: BoundSkill,
  setConfig: WeaponSetConfiguration
): { isCompatible: boolean; reason?: string } {
  const req = skill.requirements;
  if (!req) {
    return { isCompatible: true };
  }

  const mainWeapon = setConfig.mainHand;
  const offWeapon = setConfig.offHand;

  if (req.requiresShield && offWeapon?.weaponType !== 'Shield') {
    return { isCompatible: false, reason: '此技能需要裝備盾牌 (Requires Shield)' };
  }

  if (req.requiresTwoHanded && !mainWeapon?.isTwoHanded) {
    return { isCompatible: false, reason: '此技能需要雙手武器 (Requires Two-Handed Weapon)' };
  }

  if (req.requiresDualWield) {
    const isDual = !!(mainWeapon && offWeapon && !mainWeapon.isTwoHanded && offWeapon.category === 'OneHanded');
    if (!isDual) {
      return { isCompatible: false, reason: '此技能需要雙持武器 (Requires Dual Wielding)' };
    }
  }

  if (req.allowedWeaponTypes && req.allowedWeaponTypes.length > 0) {
    const mainType = mainWeapon?.weaponType ?? 'Unarmed';
    const hasAllowedMain = req.allowedWeaponTypes.includes(mainType);
    const hasAllowedOff = offWeapon && req.allowedWeaponTypes.includes(offWeapon.weaponType);

    if (!hasAllowedMain && !hasAllowedOff) {
      return {
        isCompatible: false,
        reason: `此技能需要以下武器類型: ${req.allowedWeaponTypes.join(', ')}`
      };
    }
  }

  if (req.disallowedWeaponTypes && mainWeapon) {
    if (req.disallowedWeaponTypes.includes(mainWeapon.weaponType)) {
      return {
        isCompatible: false,
        reason: `此技能無法搭配 ${mainWeapon.weaponType} 使用`
      };
    }
  }

  return { isCompatible: true };
}

export function resolveSkillBinding(
  skill: BoundSkill,
  loadout: DualWeaponLoadout
): BoundSkill {
  const pref = skill.preference;

  if (pref === 'Set1') {
    const compat = checkSkillCompatibility(skill, loadout.set1);
    return {
      ...skill,
      resolvedSet: 'Set1',
      isCompatible: compat.isCompatible,
      incompatibilityReason: compat.reason
    };
  }

  if (pref === 'Set2') {
    const compat = checkSkillCompatibility(skill, loadout.set2);
    return {
      ...skill,
      resolvedSet: 'Set2',
      isCompatible: compat.isCompatible,
      incompatibilityReason: compat.reason
    };
  }

  // Auto mode: check both sets and automatically resolve
  const compat1 = checkSkillCompatibility(skill, loadout.set1);
  const compat2 = checkSkillCompatibility(skill, loadout.set2);

  if (compat1.isCompatible && !compat2.isCompatible) {
    return { ...skill, resolvedSet: 'Set1', isCompatible: true };
  }
  if (compat2.isCompatible && !compat1.isCompatible) {
    return { ...skill, resolvedSet: 'Set2', isCompatible: true };
  }
  if (compat1.isCompatible && compat2.isCompatible) {
    return { ...skill, resolvedSet: loadout.activeSet, isCompatible: true };
  }

  return {
    ...skill,
    resolvedSet: loadout.activeSet,
    isCompatible: false,
    incompatibilityReason: compat1.reason ?? compat2.reason ?? '兩組武器皆不符合技能需求'
  };
}

export function resolveAllSkills(
  skills: BoundSkill[],
  loadout: DualWeaponLoadout
): BoundSkill[] {
  return skills.map(skill => resolveSkillBinding(skill, loadout));
}

const BOW_CROSSBOW_TYPES: PoE2WeaponType[] = ['Bow', 'Crossbow'];
const QUARTERSTAFF_TYPES: PoE2WeaponType[] = ['Quarterstaff'];
const CASTER_TYPES: PoE2WeaponType[] = ['Wand', 'Staff', 'Sceptre', 'Focus'];
const MELEE_TYPES: PoE2WeaponType[] = [
  'OneHandSword',
  'OneHandAxe',
  'OneHandMace',
  'TwoHandSword',
  'TwoHandAxe',
  'TwoHandMace',
  'Dagger',
  'Flail',
  'Spear',
  'Warstaff'
];

export function inferSkillRequirement(skillName: string): SkillWeaponRequirement {
  const lower = skillName.toLowerCase();

  if (lower.includes('shield') || lower.includes('盾牌') || lower.includes('盾衝') || lower.includes('盾擊')) {
    return { requiresShield: true };
  }
  if (lower.includes('crossbow') || lower.includes('bolt') || lower.includes('十字弓') || lower.includes('弩')) {
    return { allowedWeaponTypes: ['Crossbow'] };
  }
  if (lower.includes('bow') || lower.includes('arrow') || lower.includes('shot') || lower.includes('弓') || lower.includes('箭')) {
    return { allowedWeaponTypes: BOW_CROSSBOW_TYPES };
  }
  if (lower.includes('quarterstaff') || lower.includes('掌') || lower.includes('旋風杖') || lower.includes('雙頭杖')) {
    return { allowedWeaponTypes: QUARTERSTAFF_TYPES };
  }
  if (lower.includes('spell') || lower.includes('spark') || lower.includes('fireball') || lower.includes('法術') || lower.includes('電球') || lower.includes('火球')) {
    return { allowedWeaponTypes: CASTER_TYPES };
  }
  if (lower.includes('cleave') || lower.includes('slam') || lower.includes('strike') || lower.includes('重擊') || lower.includes('橫掃') || lower.includes('劈砍')) {
    return { allowedWeaponTypes: MELEE_TYPES };
  }

  return {};
}
