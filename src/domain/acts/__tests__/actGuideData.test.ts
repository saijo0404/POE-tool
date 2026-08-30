import { describe, it, expect } from 'vitest';
import { ACT_GUIDE_DATA } from '../actGuideData';

describe('ACT_GUIDE_DATA', () => {
  it('contains exactly 10 acts in sequential order', () => {
    expect(ACT_GUIDE_DATA).toHaveLength(10);
    ACT_GUIDE_DATA.forEach((act, idx) => {
      expect(act.act).toBe(idx + 1);
      expect(act.title).toBeTruthy();
      expect(act.townName).toBeTruthy();
      expect(act.steps.length).toBeGreaterThan(0);
    });
  });

  it('verifies that each step has a unique id and non-empty name', () => {
    const stepIds = new Set<string>();
    ACT_GUIDE_DATA.forEach(act => {
      act.steps.forEach(step => {
        expect(step.id).toBeTruthy();
        expect(stepIds.has(step.id)).toBe(false);
        stepIds.add(step.id);
        expect(step.zoneName).toBeTruthy();
        expect(step.zoneLevel).toBeGreaterThan(0);
      });
    });
  });
});
