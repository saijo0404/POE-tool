import { describe, it, expect, beforeEach } from 'vitest';
import { Poe2RunTracker } from '../poe2RunTracker';
import type { Poe2LogEvent } from '../types';

describe('Poe2RunTracker', () => {
  let tracker: Poe2RunTracker;

  beforeEach(() => {
    tracker = new Poe2RunTracker();
  });

  it('should start a run when entering an endgame map and carry mapTier from generation', () => {
    const t0 = 1700000000000;
    tracker.processEvent({
      type: 'AREA_GENERATED',
      timestamp: t0,
      rawText: '',
      areaName: 'Riverside Bluff',
      level: 79,
      mapTier: 15
    });

    const res = tracker.processEvent({
      type: 'AREA_ENTERED',
      timestamp: t0 + 5000,
      rawText: '',
      areaName: 'Riverside Bluff',
      isTown: false,
      isHideout: false,
      isEndgameMap: true
    });

    expect(res?.runStarted).toBeDefined();
    expect(res?.runStarted?.mapName).toBe('Riverside Bluff');
    expect(res?.runStarted?.mapTier).toBe(15);
    expect(res?.runStarted?.engine).toBe('poe2');
  });

  it('should accumulate gold, boss kills, deaths, and item drops during a run', () => {
    const t0 = 1700000000000;
    tracker.processEvent({
      type: 'AREA_ENTERED',
      timestamp: t0,
      rawText: '',
      areaName: 'Oasis Ruins',
      isTown: false,
      isHideout: false,
      isEndgameMap: true
    });

    tracker.processEvent({
      type: 'GOLD_RECEIVED',
      timestamp: t0 + 10000,
      rawText: '',
      amount: 1500
    });
    tracker.processEvent({
      type: 'GOLD_RECEIVED',
      timestamp: t0 + 20000,
      rawText: '',
      amount: 2500
    });
    tracker.processEvent({
      type: 'PLAYER_DIED',
      timestamp: t0 + 30000,
      rawText: ''
    });
    tracker.processEvent({
      type: 'BOSS_SLAIN',
      timestamp: t0 + 40000,
      rawText: '',
      bossName: 'Oasis Titan'
    });
    tracker.processEvent({
      type: 'ITEM_RECEIVED',
      timestamp: t0 + 45000,
      rawText: '',
      itemName: 'Waystone (Tier 16)',
      category: 'waystone',
      tier: 16,
      amount: 2
    });
    tracker.processEvent({
      type: 'ITEM_RECEIVED',
      timestamp: t0 + 46000,
      rawText: '',
      itemName: 'Desert Rune',
      category: 'rune',
      amount: 1
    });

    const current = tracker.getCurrentRun();
    expect(current?.goldEarned).toBe(4000);
    expect(current?.deathCount).toBe(1);
    expect(current?.bossSlain).toBe(true);
    expect(current?.waystonesFound).toBe(2);
    expect(current?.runesFound).toBe(1);
  });

  it('should complete run and calculate gold/hr when returning to hideout', () => {
    const t0 = 1700000000000;
    tracker.processEvent({
      type: 'AREA_ENTERED',
      timestamp: t0,
      rawText: '',
      areaName: 'Riverside Bluff',
      isTown: false,
      isHideout: false,
      isEndgameMap: true
    });

    tracker.processEvent({
      type: 'GOLD_RECEIVED',
      timestamp: t0 + 30000,
      rawText: '',
      amount: 10000
    });

    // End run at 60 seconds (1 minute)
    const transition = tracker.processEvent({
      type: 'AREA_ENTERED',
      timestamp: t0 + 60000,
      rawText: '',
      areaName: 'Hideout',
      isTown: false,
      isHideout: true,
      isEndgameMap: false
    });

    expect(transition?.runCompleted).toBeDefined();
    const run = transition!.runCompleted!;
    expect(run.durationSeconds).toBe(60);
    expect(run.goldEarned).toBe(10000);
    // 10,000 gold in 60s -> 600,000 /hr
    expect(run.goldPerHour).toBe(600000);
    expect(tracker.getCompletedRuns()).toHaveLength(1);
    expect(tracker.getCurrentRun()).toBeNull();
  });

  it('should not start a second run when re-entering the same map after dying', () => {
    const t0 = 1700000000000;
    const mapEvent: Poe2LogEvent = {
      type: 'AREA_ENTERED',
      timestamp: t0,
      rawText: '',
      areaName: 'Riverside Bluff',
      isTown: false,
      isHideout: false,
      isEndgameMap: true
    };

    tracker.processEvent(mapEvent);
    tracker.processEvent({
      type: 'GOLD_RECEIVED',
      timestamp: t0 + 10000,
      rawText: '',
      amount: 500
    });

    // Re-entering same map name
    const res = tracker.processEvent({
      ...mapEvent,
      timestamp: t0 + 20000
    });

    expect(res?.runStarted).toBeUndefined();
    expect(tracker.getCurrentRun()?.goldEarned).toBe(500);
    expect(tracker.getCompletedRuns()).toHaveLength(0);
  });

  it('should parse and track runs end-to-end from multi-run log text', () => {
    const logText = `
2024/12/06 18:00:00 [INFO Client] : Generating level 79 area "Riverside Bluff" with seed 1
2024/12/06 18:00:05 [INFO Client] : Entering area Riverside Bluff
2024/12/06 18:01:00 [INFO Client] : You have received 3,000 Gold.
2024/12/06 18:01:30 [INFO Client] : Quest Complete: Defeat the Map Boss
2024/12/06 18:02:05 [INFO Client] : You have entered Hideout.
2024/12/06 18:05:00 [INFO Client] : Generating level 80 area "Oasis Ruins" with seed 2
2024/12/06 18:05:10 [INFO Client] : Entering area Oasis Ruins
2024/12/06 18:06:00 [INFO Client] : You have received 4,500 Gold.
2024/12/06 18:06:30 [INFO Client] : You have died.
2024/12/06 18:07:10 [INFO Client] : You have entered Clearfell Encampment.
    `.trim();

    const runs = tracker.processLogText(logText);
    expect(runs).toHaveLength(2);

    expect(runs[0].mapName).toBe('Riverside Bluff');
    expect(runs[0].mapTier).toBe(15);
    expect(runs[0].goldEarned).toBe(3000);
    expect(runs[0].bossSlain).toBe(true);
    expect(runs[0].deathCount).toBe(0);

    expect(runs[1].mapName).toBe('Oasis Ruins');
    expect(runs[1].mapTier).toBe(16);
    expect(runs[1].goldEarned).toBe(4500);
    expect(runs[1].deathCount).toBe(1);
    expect(runs[1].bossSlain).toBe(false);
  });
});
