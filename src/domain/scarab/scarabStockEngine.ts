import type {
  ScarabItem,
  ScarabStockStrategy,
  ScarabShortage,
  ScarabAuditResult
} from './scarabTypes';

export function getScarabById(id: string, library: ScarabItem[]): ScarabItem | undefined {
  return library.find(s => s.id === id);
}

function calculatePlayableRuns(
  inventory: Record<string, number>,
  requirements: ScarabStockStrategy['requirements']
): { maxRuns: number; bottleneckId?: string } {
  if (requirements.length === 0) return { maxRuns: 0 };
  let minRuns = Infinity;
  let bottleneckId: string | undefined;

  for (const req of requirements) {
    const qty = inventory[req.scarabId] || 0;
    const runs = Math.floor(qty / (req.quantityPerMap || 1));
    if (runs < minRuns) {
      minRuns = runs;
      bottleneckId = req.scarabId;
    }
  }

  return { maxRuns: minRuns === Infinity ? 0 : minRuns, bottleneckId };
}

function computeShortages(
  inventory: Record<string, number>,
  requirements: ScarabStockStrategy['requirements'],
  targetRuns: number,
  library: ScarabItem[]
): ScarabShortage[] {
  const shortages: ScarabShortage[] = [];
  for (const req of requirements) {
    const scarab = getScarabById(req.scarabId, library);
    const needed = targetRuns * req.quantityPerMap;
    const current = inventory[req.scarabId] || 0;
    if (current < needed) {
      const missing = needed - current;
      const unitCost = scarab?.unitCostChaos || 10;
      shortages.push({
        scarabId: req.scarabId,
        nameZh: scarab?.nameZh || req.scarabId,
        nameEn: scarab?.nameEn || req.scarabId,
        currentStock: current,
        neededStock: needed,
        missingQuantity: missing,
        estimatedCostChaos: missing * unitCost
      });
    }
  }
  return shortages;
}

function generateBulkMessage(shortages: ScarabShortage[]): string {
  if (shortages.length === 0) return '庫存充裕，無需補貨。';
  const list = shortages.map(s => `${s.missingQuantity}x ${s.nameEn} (${s.nameZh})`).join(', ');
  return `@bulk Hi, I would like to buy: ${list}`;
}

export function auditScarabStock(
  inventory: Record<string, number>,
  strategy: ScarabStockStrategy,
  scarabLibrary: ScarabItem[],
  divineRate = 150
): ScarabAuditResult {
  const { maxRuns, bottleneckId } = calculatePlayableRuns(inventory, strategy.requirements);
  const shortages = computeShortages(inventory, strategy.requirements, strategy.targetMapRuns, scarabLibrary);

  const totalCostChaos = shortages.reduce((acc, s) => acc + s.estimatedCostChaos, 0);
  const totalCostDivine = Number((totalCostChaos / divineRate).toFixed(2));
  const completionPct = strategy.targetMapRuns > 0
    ? Math.min(100, Math.round((maxRuns / strategy.targetMapRuns) * 100))
    : 100;

  return {
    strategyId: strategy.id,
    targetMapRuns: strategy.targetMapRuns,
    maxPlayableRuns: maxRuns,
    bottleneckScarabId: bottleneckId,
    completionPct,
    shortages,
    totalRestockCostChaos: totalCostChaos,
    totalRestockCostDivine: totalCostDivine,
    bulkWhisperCommand: generateBulkMessage(shortages)
  };
}
