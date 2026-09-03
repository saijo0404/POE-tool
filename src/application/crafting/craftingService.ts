import type {
  CraftActuaryResult,
  CraftBaseItem,
  TargetModSelection,
} from '../../domain/crafting/types';
import { evaluateCraftingActuary } from '../../domain/crafting/craftingCalculator';
import { Result, ok, err } from '../../domain/errors/Result';
import { DomainError } from '../../domain/errors/DomainError';

export interface CraftingServiceParams {
  baseItem: CraftBaseItem | null;
  ilvl: number;
  targetMods: TargetModSelection[];
  divineRate?: number;
  ninjaRates?: Record<string, number>;
}

export class CraftingService {
  static evaluate(params: CraftingServiceParams): Result<CraftActuaryResult, DomainError> {
    const { baseItem, ilvl, targetMods, divineRate = 150, ninjaRates } = params;

    if (!baseItem) {
      return err(DomainError.validation('請選擇裝備基底'));
    }

    if (ilvl < 1 || ilvl > 100) {
      return err(DomainError.validation('物品等級必須介於 1 至 100 之間'));
    }

    // Extract custom prices from ninjaRates if available
    const customPrices = this.extractNinjaPrices(ninjaRates);

    try {
      const result = evaluateCraftingActuary({
        baseItem,
        ilvl,
        targetMods,
        divineRate,
        customPrices,
      });
      return ok(result);
    } catch (e) {
      return err(DomainError.validation(`工藝成本計算失敗: ${e instanceof Error ? e.message : String(e)}`));
    }
  }

  private static extractNinjaPrices(ninjaRates?: Record<string, number>): Record<string, number> | undefined {
    if (!ninjaRates) return undefined;
    const prices: Record<string, number> = {};

    for (const [key, val] of Object.entries(ninjaRates)) {
      const lower = key.toLowerCase();
      if (lower.includes('greed')) prices['essence_greed'] = val;
      if (lower.includes('wrath')) prices['essence_wrath'] = val;
      if (lower.includes('anger')) prices['essence_anger'] = val;
      if (lower.includes('hatred')) prices['essence_hatred'] = val;
      if (lower.includes('envy')) prices['essence_envy'] = val;
      if (lower.includes('zeal')) prices['essence_zeal'] = val;
      if (lower.includes('loathing')) prices['essence_loathing'] = val;
      if (lower.includes('scorn')) prices['essence_scorn'] = val;
      if (lower.includes('pristine')) prices['pristine_fossil'] = val;
      if (lower.includes('dense')) prices['dense_fossil'] = val;
      if (lower.includes('prismatic')) prices['prismatic_fossil'] = val;
    }

    return prices;
  }
}
