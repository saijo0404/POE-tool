import type {
  PoE2WeaponType,
  WeaponCategory,
  EquippedWeapon
} from './types';
import type { ParsedItem } from '../item/types';

const TWO_HANDED_TYPES = new Set<PoE2WeaponType>([
  'Bow',
  'Crossbow',
  'Staff',
  'Warstaff',
  'Quarterstaff',
  'TwoHandSword',
  'TwoHandAxe',
  'TwoHandMace'
]);

const OFF_HAND_TYPES = new Set<PoE2WeaponType>(['Shield', 'Focus', 'Quiver']);

export function isTwoHanded(type: PoE2WeaponType): boolean {
  return TWO_HANDED_TYPES.has(type);
}

export function getWeaponCategory(type: PoE2WeaponType): WeaponCategory {
  if (type === 'Unarmed') return 'Unarmed';
  if (OFF_HAND_TYPES.has(type)) return 'OffHand';
  if (isTwoHanded(type)) return 'TwoHanded';
  return 'OneHanded';
}

const WEAPON_MATCHERS: Array<{ type: PoE2WeaponType; pattern: RegExp }> = [
  // Two handed first to avoid partial matches
  { type: 'Quarterstaff', pattern: /(?:Quarterstaff|雙頭杖|僧兵杖|旋風杖)/i },
  { type: 'Crossbow', pattern: /(?:Crossbow|十字弓|重弩|弩)/i },
  { type: 'Bow', pattern: /(?:Bow|弓|長弓|短弓|戰弓)/i },
  { type: 'TwoHandSword', pattern: /(?:Greatsword|Two-Hand.*Sword|雙手劍|巨劍)/i },
  { type: 'TwoHandAxe', pattern: /(?:Greataxe|Two-Hand.*Axe|雙手斧|巨斧)/i },
  { type: 'TwoHandMace', pattern: /(?:Greatmace|Maul|Two-Hand.*Mace|雙手槌|巨槌)/i },
  { type: 'Warstaff', pattern: /(?:Warstaff|戰棍)/i },
  { type: 'Staff', pattern: /(?:Staff|長棍|法杖)/i },
  // Off hands
  { type: 'Quiver', pattern: /(?:Quiver|箭袋)/i },
  { type: 'Focus', pattern: /(?:Focus|法器|咒具)/i },
  { type: 'Shield', pattern: /(?:Shield|Buckler|盾牌|圓盾|鳶盾|塔盾)/i },
  // One handed
  { type: 'Spear', pattern: /(?:Spear|Javelin|長矛|單手長矛|標槍)/i },
  { type: 'Flail', pattern: /(?:Flail|連枷|鏈枷)/i },
  { type: 'Sceptre', pattern: /(?:Sceptre|權杖)/i },
  { type: 'Wand', pattern: /(?:Wand|魔杖)/i },
  { type: 'Dagger', pattern: /(?:Dagger|Kris|Dirk|匕首)/i },
  { type: 'OneHandAxe', pattern: /(?:Axe|Cleaver|Hatchet|單手斧|斧)/i },
  { type: 'OneHandMace', pattern: /(?:Mace|Club|單手槌|槌|釘頭槌)/i },
  { type: 'OneHandSword', pattern: /(?:Sword|Rapier|Sabre|Blade|單手劍|細劍|軍刀)/i }
];

export function classifyWeaponType(baseType: string, itemClass?: string): PoE2WeaponType {
  const combined = `${itemClass ?? ''} ${baseType}`.trim();
  for (const { type, pattern } of WEAPON_MATCHERS) {
    if (pattern.test(combined)) {
      return type;
    }
  }
  return 'Unarmed';
}

export function isValidOffHand(mainHand: PoE2WeaponType, offHand: PoE2WeaponType): boolean {
  if (mainHand === 'Bow') return offHand === 'Quiver';
  if (mainHand === 'Crossbow') return offHand === 'Quiver';
  if (isTwoHanded(mainHand)) return false;
  if (offHand === 'Quiver') return false;
  return getWeaponCategory(offHand) === 'OneHanded' || OFF_HAND_TYPES.has(offHand);
}

export function createEquippedWeaponFromParsedItem(item: ParsedItem): EquippedWeapon | null {
  const weaponType = classifyWeaponType(item.baseType, item.itemClass);
  if (weaponType === 'Unarmed') return null;

  return {
    id: `${item.name || item.baseType}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: item.name || item.baseType,
    baseType: item.baseType,
    weaponType,
    category: getWeaponCategory(weaponType),
    isTwoHanded: isTwoHanded(weaponType),
    spirit: item.spirit,
    levelRequirement: item.itemLevel
  };
}
