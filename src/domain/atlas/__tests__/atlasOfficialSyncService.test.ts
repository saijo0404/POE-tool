import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  parseOfficialGggData,
  detectMechanicCategory,
  loadCachedAtlasTreeData
} from '../atlasOfficialSyncService';

describe('atlasOfficialSyncService', () => {
  it('correctly calculates 1:1 official node coordinates using group and orbit trigonometry', () => {
    const mockGggData = {
      tree: 'Atlas',
      groups: {
        '10': {
          x: 1000,
          y: -2000,
          orbits: [0, 1],
          nodes: ['101', '102']
        }
      },
      nodes: {
        root: { out: ['101'] },
        '101': {
          skill: 101,
          name: 'Essence Chance',
          group: 10,
          orbit: 0,
          orbitIndex: 0,
          out: ['102'],
          in: [],
          stats: ['+10% chance to contain an Essence']
        },
        '102': {
          skill: 102,
          name: 'Unending Nightmare',
          isKeystone: true,
          group: 10,
          orbit: 1, // Radius = 82
          orbitIndex: 0, // Angle = 0 deg (Up: sin(0)=0, -cos(0)=-1)
          out: [],
          in: ['101'],
          stats: ['Delirium fog never dissipates']
        }
      }
    };

    const parsed = parseOfficialGggData(mockGggData, 1.0);
    expect(parsed.length).toBeGreaterThanOrEqual(2);

    const node101 = parsed.find(n => n.id === '101')!;
    expect(node101).toBeDefined();
    expect(node101.x).toBe(1000);
    expect(node101.y).toBe(-2000);
    expect(node101.category).toBe('essence');

    const node102 = parsed.find(n => n.id === '102')!;
    expect(node102).toBeDefined();
    // Orbit 1 radius = 82, angle 0 => x = 1000 + 82*sin(0) = 1000, y = -2000 - 82*cos(0) = -2082
    expect(node102.x).toBe(1000);
    expect(node102.y).toBe(-2082);
    expect(node102.type).toBe('keystone');
    expect(node102.category).toBe('delirium');

    // Verify bidirectional connections
    expect(node101.connections).toContain('102');
    expect(node102.connections).toContain('101');
  });

  it('accurately classifies mechanic categories from stats and names', () => {
    expect(detectMechanicCategory('Prolific Essence', ['Contains an Essence'])).toBe('essence');
    expect(detectMechanicCategory('Secret Stash', ['Strongbox contains additional items'])).toBe('ambush');
    expect(detectMechanicCategory('Heart of the Grove', ['Harvest lifeforce'])).toBe('harvest');
    expect(detectMechanicCategory('Runic Monsters', ['Expedition logbook drop chance'])).toBe('expedition');
    expect(detectMechanicCategory('Timeless Conflict', ['Legion splinters drop'])).toBe('legion');
    expect(detectMechanicCategory('Simulacrum Splinters', ['Mirror of Delirium'])).toBe('delirium');
    expect(detectMechanicCategory('Tribute Rewards', ['Ritual altars'])).toBe('ritual');
    expect(detectMechanicCategory('Chayula Presence', ['Breachstone drop chance'])).toBe('breach');
    expect(detectMechanicCategory('Beyond Demons', ['Tainted currency'])).toBe('beyond');
    expect(detectMechanicCategory('Cassia Pride', ['Blighted map reward'])).toBe('blight');
    expect(detectMechanicCategory('Scarab Dropper', ['More Scarabs found'])).toBe('scarab');
    expect(detectMechanicCategory('Eldritch Altars', ['Searing Exarch influence'])).toBe('boss');
    expect(detectMechanicCategory('Einhar Beastcraft', ['Red Beast capture'])).toBe('bestiary');
    expect(detectMechanicCategory('Torment Spirits', ['Possessed monsters'])).toBe('torment');
    expect(detectMechanicCategory('Connected Map Drops', ['Tier 16 Map drop chance'])).toBe('map');
  });

  it('parses full raw official GGG dataset and produces complete 1:1 atlas tree', () => {
    const rawPath = path.resolve(__dirname, '../data/ggg_atlas_raw.json');
    if (fs.existsSync(rawPath)) {
      const rawContent = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
      const parsed = parseOfficialGggData(rawContent);
      expect(parsed.length).toBeGreaterThan(800);

      const targetPath = path.resolve(__dirname, '../data/officialAtlasTree.json');
      fs.writeFileSync(targetPath, JSON.stringify(parsed, null, 2), 'utf8');
    }
  });

  it('falls back safely to default dataset when cache is empty', () => {
    const data = loadCachedAtlasTreeData();
    expect(data.length).toBeGreaterThan(800);
  });
});
