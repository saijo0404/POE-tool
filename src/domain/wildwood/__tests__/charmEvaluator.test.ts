import { describe, it, expect } from 'vitest';
import { evaluateWildwoodBuild, getCharmAffixById, getMajorNodeById } from '../charmEvaluator';
import type { WildwoodConfig } from '../types';

describe('charmEvaluator', () => {
  describe('lookup helpers', () => {
    it('retrieves major node by ID', () => {
      const node = getMajorNodeById('warden_barkskin');
      expect(node).toBeDefined();
      expect(node?.nameZh).toContain('樹皮防護');
      expect(node?.ascendancy).toBe('warden');
    });

    it('retrieves charm affix by ID', () => {
      const affix = getCharmAffixById('charm_life_leech');
      expect(affix).toBeDefined();
      expect(affix?.statKey).toBe('lifeLeech');
    });
  });

  describe('evaluateWildwoodBuild', () => {
    it('evaluates Warden of the Maji nodes properly', () => {
      const config: WildwoodConfig = {
        ascendancy: 'warden',
        allocatedNodeIds: ['warden_barkskin', 'warden_oath_of_maji'],
        charms: []
      };

      const result = evaluateWildwoodBuild(config);
      expect(result.ascendancy).toBe('warden');
      expect(result.specialFlags).toContain('樹皮防護生效 (Barkskin Active)');
      expect(result.specialFlags).toContain('瑪濟誓約 (Oath of the Maji)');
      expect(result.fitScore).toBeGreaterThan(30);
      expect(result.fitTier).toBeDefined();
    });

    it('evaluates Warlock of the Mists nodes properly', () => {
      const config: WildwoodConfig = {
        ascendancy: 'warlock',
        allocatedNodeIds: ['warlock_sanguimancy', 'warlock_ravenous'],
        charms: []
      };

      const result = evaluateWildwoodBuild(config);
      expect(result.ascendancy).toBe('warlock');
      expect(result.specialFlags).toContain('鮮血法術 (Sanguimancy: Life Cost)');
      expect(result.specialFlags).toContain('漆黑飢渴 (Ravenous Monster Debuff)');
    });

    it('evaluates Wildwood Primalist with slotted charms', () => {
      const config: WildwoodConfig = {
        ascendancy: 'primalist',
        allocatedNodeIds: ['primalist_charms_1', 'primalist_charms_2', 'primalist_charms_3'],
        charms: [
          {
            slotIndex: 0,
            affix1Id: 'charm_all_res',
            affix1Roll: 15,
            affix2Id: 'charm_max_life',
            affix2Roll: 48
          },
          {
            slotIndex: 1,
            affix1Id: 'charm_suppress',
            affix1Roll: 12
          },
          {
            slotIndex: 2,
            affix1Id: 'charm_flask_effect',
            affix1Roll: 18
          }
        ]
      };

      const result = evaluateWildwoodBuild(config);
      expect(result.ascendancy).toBe('primalist');
      expect(result.aggregateStats['allResist']).toBe(15);
      expect(result.aggregateStats['maxLife']).toBe(48);
      expect(result.aggregateStats['spellSuppression']).toBe(12);
      expect(result.aggregateStats['flaskEffect']).toBe(18);
      expect(result.fitScore).toBeGreaterThanOrEqual(70);
      expect(['S', 'A']).toContain(result.fitTier);
    });

    it('ignores charms when non-primalist ascendancy is selected and gives recommendation', () => {
      const config: WildwoodConfig = {
        ascendancy: 'warden',
        allocatedNodeIds: ['warden_barkskin'],
        charms: [
          {
            slotIndex: 0,
            affix1Id: 'charm_all_res',
            affix1Roll: 15
          }
        ]
      };

      const result = evaluateWildwoodBuild(config);
      expect(result.aggregateStats['allResist']).toBeUndefined();
      expect(result.recommendations.some(r => r.includes('荒野追獵者'))).toBe(true);
    });
  });
});
