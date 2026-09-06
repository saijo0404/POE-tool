import type { MapRun, MapInvestment, Poe2LogEvent, Poe2AreaEnteredEvent } from './types';
import { DEFAULT_MAP_INVESTMENT } from './constants';
import { calculateGoldPerHour } from './poe2MappingCalculator';
import { parsePoe2LogBatch } from './poe2LogParser';

export interface RunTrackerTransition {
  runCompleted?: MapRun;
  runStarted?: Partial<MapRun>;
}

export class Poe2RunTracker {
  private currentRun: Partial<MapRun> | null = null;
  private lastAreaGenerated: { areaName: string; level: number; mapTier: number } | null = null;
  private completedRuns: MapRun[] = [];
  private defaultInvestment: MapInvestment;

  constructor(defaultInvestment: MapInvestment = { ...DEFAULT_MAP_INVESTMENT }) {
    this.defaultInvestment = defaultInvestment;
  }

  getCurrentRun(): Partial<MapRun> | null {
    return this.currentRun ? { ...this.currentRun } : null;
  }

  getCompletedRuns(): MapRun[] {
    return [...this.completedRuns];
  }

  reset(): void {
    this.currentRun = null;
    this.lastAreaGenerated = null;
    this.completedRuns = [];
  }

  private startMapRun(areaName: string, timestamp: number): Partial<MapRun> {
    const tier = this.lastAreaGenerated?.areaName === areaName ? this.lastAreaGenerated.mapTier : undefined;
    const runNumber = this.completedRuns.length + 1;
    this.currentRun = {
      id: `run_poe2_${timestamp}_${runNumber}`,
      runNumber,
      mapName: areaName,
      mapTier: tier,
      startTime: timestamp,
      investment: { ...this.defaultInvestment },
      grossRevenueChaos: 0,
      grossRevenueDivine: 0,
      netProfitChaos: 0,
      netProfitDivine: 0,
      drops: [],
      tabNames: [],
      engine: 'poe2',
      goldEarned: 0,
      goldPerHour: 0,
      waystonesFound: 0,
      runesFound: 0,
      bossSlain: false,
      deathCount: 0
    };
    return this.currentRun;
  }

  finishCurrentRun(endTime: number = Date.now()): MapRun | null {
    if (!this.currentRun || !this.currentRun.startTime) return null;
    const durationSeconds = Math.max(1, Math.round((endTime - this.currentRun.startTime) / 1000));
    const goldEarned = this.currentRun.goldEarned || 0;
    const goldPerHour = calculateGoldPerHour(goldEarned, durationSeconds);

    const completed: MapRun = {
      ...(this.currentRun as MapRun),
      endTime,
      durationSeconds,
      goldPerHour
    };

    this.completedRuns.push(completed);
    this.currentRun = null;
    return completed;
  }

  private handleAreaEntered(event: Poe2AreaEnteredEvent): RunTrackerTransition {
    if (event.isHideout || event.isTown) {
      if (this.currentRun) {
        const runCompleted = this.finishCurrentRun(event.timestamp);
        return runCompleted ? { runCompleted } : {};
      }
      return {};
    }

    if (event.isEndgameMap) {
      if (this.currentRun && this.currentRun.mapName === event.areaName) {
        return {};
      }
      let runCompleted: MapRun | undefined;
      if (this.currentRun) {
        runCompleted = this.finishCurrentRun(event.timestamp) ?? undefined;
      }
      const runStarted = this.startMapRun(event.areaName, event.timestamp);
      return { runCompleted, runStarted };
    }

    return {};
  }

  private handleInGameEvent(event: Poe2LogEvent): void {
    if (!this.currentRun) return;
    if (event.type === 'GOLD_RECEIVED') {
      this.currentRun.goldEarned = (this.currentRun.goldEarned || 0) + event.amount;
    } else if (event.type === 'PLAYER_DIED') {
      this.currentRun.deathCount = (this.currentRun.deathCount || 0) + 1;
    } else if (event.type === 'BOSS_SLAIN') {
      this.currentRun.bossSlain = true;
    } else if (event.type === 'ITEM_RECEIVED') {
      if (event.category === 'waystone') {
        this.currentRun.waystonesFound = (this.currentRun.waystonesFound || 0) + event.amount;
      } else if (event.category === 'rune') {
        this.currentRun.runesFound = (this.currentRun.runesFound || 0) + event.amount;
      }
    }
  }

  processEvent(event: Poe2LogEvent): RunTrackerTransition | null {
    if (event.type === 'AREA_GENERATED') {
      this.lastAreaGenerated = { areaName: event.areaName, level: event.level, mapTier: event.mapTier };
      return null;
    }
    if (event.type === 'AREA_ENTERED') {
      return this.handleAreaEntered(event);
    }
    this.handleInGameEvent(event);
    return null;
  }

  processLogText(text: string): MapRun[] {
    const events = parsePoe2LogBatch(text);
    for (const ev of events) {
      this.processEvent(ev);
    }
    if (this.currentRun && events.length > 0) {
      const lastTs = events[events.length - 1].timestamp;
      this.finishCurrentRun(lastTs);
    }
    return this.getCompletedRuns();
  }
}
