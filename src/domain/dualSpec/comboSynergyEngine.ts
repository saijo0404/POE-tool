import type { DualWeaponLoadout } from './types';
import type { ComboStep, ComboSynergyReport, ComboStatusEffect } from './deltaTypes';

interface SynergyPair {
  prime: ComboStatusEffect;
  trigger: ComboStatusEffect;
  name: string;
  multiplier: number;
}

const SYNERGY_PAIRS: SynergyPair[] = [
  { prime: 'Oil', trigger: 'Ignite', name: '焦油燃爆 (Oil & Fire Detonation)', multiplier: 0.35 },
  { prime: 'Freeze', trigger: 'Stun', name: '冰凍碎裂猛擊 (Shatter Stun Slam)', multiplier: 0.30 },
  { prime: 'ArmourBreak', trigger: 'Bleed', name: '破甲割裂穿透 (Armour Break Bleed)', multiplier: 0.25 },
  { prime: 'Shock', trigger: 'Ignite', name: '超載感電燃燒 (Shock Overload)', multiplier: 0.20 },
  { prime: 'Stun', trigger: 'Bleed', name: '擊暈處決 (Stun Execution)', multiplier: 0.20 }
];

export function evaluateComboChain(
  steps: ComboStep[],
  _loadout?: DualWeaponLoadout
): ComboSynergyReport {
  if (!steps || steps.length === 0) {
    return {
      steps: [],
      synergyScore: 0,
      crossWeaponSwaps: 0,
      comboMultiplier: 1.0,
      synergiesTriggered: []
    };
  }

  let crossWeaponSwaps = 0;
  let accumulatedMultiplier = 1.0;
  const synergiesTriggered: string[] = [];

  let activeEffect: ComboStatusEffect | undefined = undefined;

  for (let i = 0; i < steps.length; i++) {
    const current = steps[i];
    if (i > 0 && current.weaponSet !== steps[i - 1].weaponSet) {
      crossWeaponSwaps++;
    }

    if (activeEffect && (current.consumesEffect || current.appliedEffect)) {
      const effectToTrigger = current.consumesEffect ?? current.appliedEffect;
      const matched = SYNERGY_PAIRS.find(
        p => p.prime === activeEffect && p.trigger === effectToTrigger
      );

      if (matched) {
        accumulatedMultiplier += matched.multiplier;
        synergiesTriggered.push(matched.name);
        activeEffect = undefined; // effect consumed
        continue;
      }
    }

    if (current.appliedEffect) {
      activeEffect = current.appliedEffect;
    }
  }

  // Calculate composite synergy score
  let baseScore = 40;
  if (crossWeaponSwaps > 0) {
    baseScore += Math.min(30, crossWeaponSwaps * 15);
  }
  baseScore += Math.min(30, synergiesTriggered.length * 15);

  const synergyScore = Math.min(100, Math.max(0, baseScore));
  const comboMultiplier = Math.round(accumulatedMultiplier * 100) / 100;

  return {
    steps,
    synergyScore,
    crossWeaponSwaps,
    comboMultiplier,
    synergiesTriggered
  };
}
