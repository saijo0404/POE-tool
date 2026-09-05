import type { AtlasMechanicCategory } from './types';
import { SCARAB_DATABASE, type ScarabDef } from './scarabDatabase';
import { ATLAS_NODES_MAP } from './atlasTreeDataset';

export interface ScarabSynergyInput {
  allocatedNodeIds?: string[];
  primaryCategory?: AtlasMechanicCategory;
  strategyTags?: string[];
  maxSlots?: number;
  availableScarabs?: ScarabDef[];
  ninjaRates?: Record<string, number>;
}

export interface RecommendedScarabSlot {
  scarab: ScarabDef;
  count: number;
  unitCostChaos: number;
  totalCostChaos: number;
  synergyReason: string;
}

export interface ScarabSynergyRecommendation {
  primaryMechanic: AtlasMechanicCategory;
  tier: 'S' | 'A' | 'B';
  synergyMultiplier: number;
  estimatedCostChaos: number;
  slots: RecommendedScarabSlot[];
  totalScarabsCount: number;
  summaryNote: string;
}

export function calculateMechanicWeights(input: ScarabSynergyInput): Record<string, number> {
  const weights: Record<string, number> = {};
  const addWeight = (cat: string, amount: number) => {
    if (!cat || cat === 'all' || cat === 'general' || cat === 'custom') return;
    weights[cat] = (weights[cat] || 0) + amount;
  };

  if (input.primaryCategory) {
    addWeight(input.primaryCategory, 10);
  }

  input.strategyTags?.forEach(tag => {
    const lower = tag.toLowerCase();
    addWeight(lower, 3);
  });

  input.allocatedNodeIds?.forEach(id => {
    const node = ATLAS_NODES_MAP[id];
    if (node && node.category) {
      const nodeWeight = node.type === 'keystone' ? 4 : node.type === 'notable' ? 2.5 : 1;
      addWeight(node.category, nodeWeight);
    }
  });

  return weights;
}

function resolveScarabPrice(scarab: ScarabDef, rates?: Record<string, number>): number {
  if (rates && rates[scarab.nameEn] !== undefined) {
    return rates[scarab.nameEn];
  }
  return scarab.basePriceChaos ?? 5;
}

function getScarabIntrinsicPower(scarab: ScarabDef): number {
  const desc = scarab.description;
  let power = 1.0;
  if (desc.includes('包含額外') || desc.includes('額外')) power += 0.25;
  if (desc.includes('階級提高') || desc.includes('複製') || desc.includes('倍增')) power += 0.35;
  if (desc.includes('所有') || desc.includes('將領') || desc.includes('首領') || desc.includes('多次')) power += 0.5;
  if (scarab.limit === 1) power += 0.2;
  return power;
}

function generateSynergyReason(scarab: ScarabDef): string {
  if (scarab.limit === 1) {
    return '極致質變首選：解鎖頂級將領、倍增或質變機制';
  }
  if (scarab.description.includes('階級') || scarab.description.includes('提高')) {
    return '品質階級提升：強化掉落品質與獎勵階層';
  }
  if (scarab.description.includes('額外')) {
    return '基礎密度擴張：大幅增加區域遭遇戰基底數量';
  }
  return '協同補強：放大整體機制產出與收益乘數';
}

function selectSynergizedSlots(
  scarabs: ScarabDef[],
  maxSlots: number,
  ninjaRates?: Record<string, number>
): RecommendedScarabSlot[] {
  const sorted = [...scarabs].sort((a, b) => getScarabIntrinsicPower(b) - getScarabIntrinsicPower(a));
  const slots: RecommendedScarabSlot[] = [];
  let remainingSlots = maxSlots;

  for (const sc of sorted) {
    if (remainingSlots <= 0) break;
    const canTake = Math.min(sc.limit, remainingSlots);
    if (canTake > 0) {
      const unitPrice = resolveScarabPrice(sc, ninjaRates);
      slots.push({
        scarab: sc,
        count: canTake,
        unitCostChaos: unitPrice,
        totalCostChaos: unitPrice * canTake,
        synergyReason: generateSynergyReason(sc)
      });
      remainingSlots -= canTake;
    }
  }
  return slots;
}

function calculateComboMultiplier(slots: RecommendedScarabSlot[]): number {
  if (slots.length === 0) return 1.0;
  const rawSum = slots.reduce((acc, s) => acc + getScarabIntrinsicPower(s.scarab) * s.count, 0);
  const baseBonus = 1.0 + (rawSum / (slots.length * 1.8));
  const hasMultiplier = slots.some(s => s.scarab.limit === 1);
  const hasBaseEncounter = slots.some(s => s.scarab.description.includes('額外'));
  const comboBonus = (hasMultiplier && hasBaseEncounter) ? 1.3 : 1.1;
  return Math.round(baseBonus * comboBonus * 100) / 100;
}

function determineTier(multiplier: number, count: number): 'S' | 'A' | 'B' {
  if (count >= 4 && multiplier >= 2.0) return 'S';
  if (count >= 3 && multiplier >= 1.5) return 'A';
  return 'B';
}

function createEmptyRecommendation(primaryMech: AtlasMechanicCategory): ScarabSynergyRecommendation {
  return {
    primaryMechanic: primaryMech,
    tier: 'B',
    synergyMultiplier: 1.0,
    estimatedCostChaos: 0,
    slots: [],
    totalScarabsCount: 0,
    summaryNote: `目前聖甲蟲庫尚無 ${primaryMech} 專屬甲蟲或無符合之機制。`
  };
}

export function recommendScarabCombination(input: ScarabSynergyInput): ScarabSynergyRecommendation {
  const maxSlots = input.maxSlots ?? 5;
  const db = input.availableScarabs ?? SCARAB_DATABASE;
  const weights = calculateMechanicWeights(input);

  const bestEntry = Object.entries(weights).sort((a, b) => b[1] - a[1])[0];
  const primaryMech = (bestEntry?.[0] || input.primaryCategory || 'general') as AtlasMechanicCategory;

  const candidateScarabs = db.filter(s => s.category === primaryMech);
  if (candidateScarabs.length === 0) return createEmptyRecommendation(primaryMech);

  const slots = selectSynergizedSlots(candidateScarabs, maxSlots, input.ninjaRates);
  const totalCount = slots.reduce((sum, s) => sum + s.count, 0);
  const totalCost = slots.reduce((sum, s) => sum + s.totalCostChaos, 0);
  const multiplier = calculateComboMultiplier(slots);
  const tier = determineTier(multiplier, totalCount);

  return {
    primaryMechanic: primaryMech,
    tier,
    synergyMultiplier: multiplier,
    estimatedCostChaos: totalCost,
    slots,
    totalScarabsCount: totalCount,
    summaryNote: `針對【${primaryMech}】推薦最佳 ${totalCount} 顆甲蟲組合，綜合產出加乘約 ${multiplier}x (${tier} 級協同)。`
  };
}

