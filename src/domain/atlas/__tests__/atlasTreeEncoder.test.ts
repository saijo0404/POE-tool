import { describe, it, expect } from 'vitest';
import {
  encodeAtlasTreeBase64,
  decodeAtlasTreeBase64,
  parseAtlasUrlOrBase64,
  generateAtlasTreeUrl
} from '../atlasTreeEncoder';

describe('atlasTreeEncoder', () => {
  it('encodes and decodes node IDs in roundtrip', () => {
    const sampleNodes = ['start_origin', 'map_sustain_1', 'ambush_hub_1', 'ks_singular_focus'];
    const encoded = encodeAtlasTreeBase64(sampleNodes);
    expect(encoded).toBeTruthy();
    expect(typeof encoded).toBe('string');

    const decodeResult = decodeAtlasTreeBase64(encoded);
    expect(decodeResult.isOk()).toBe(true);
    if (decodeResult.isOk()) {
      const decoded = decodeResult.value;
      expect(decoded.nodeIds).toContain('start_origin');
      expect(decoded.nodeIds).toContain('map_sustain_1');
      expect(decoded.nodeIds).toContain('ambush_hub_1');
      expect(decoded.nodeIds).toContain('ks_singular_focus');
    }
  });

  it('parses official PoE atlas tree URL', () => {
    const sampleNodes = ['start_origin', 'map_sustain_2', 'essence_hub_1'];
    const b64 = encodeAtlasTreeBase64(sampleNodes);
    const officialUrl = `https://www.pathofexile.com/fullscreen-atlas-skill-tree/${b64}`;

    const res = parseAtlasUrlOrBase64(officialUrl);
    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.nodeIds).toContain('essence_hub_1');
    }
  });

  it('parses PoEPlanner atlas tree URL', () => {
    const sampleNodes = ['start_origin', 'harvest_hub_1', 'ks_crop_rotation'];
    const b64 = encodeAtlasTreeBase64(sampleNodes);
    const poePlannerUrl = `https://poeplanner.com/atlas-tree/${b64}`;

    const res = parseAtlasUrlOrBase64(poePlannerUrl);
    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.nodeIds).toContain('harvest_hub_1');
      expect(res.value.nodeIds).toContain('ks_crop_rotation');
    }
  });

  it('generates URLs for official PoE and poeplanner', () => {
    const sampleNodes = ['start_origin', 'legion_hub_1'];
    const officialUrl = generateAtlasTreeUrl(sampleNodes, 'official');
    const plannerUrl = generateAtlasTreeUrl(sampleNodes, 'poeplanner');

    expect(officialUrl).toContain('pathofexile.com/fullscreen-atlas-skill-tree/');
    expect(plannerUrl).toContain('poeplanner.com/atlas-tree/');
  });

  it('handles invalid base64 and corrupted strings gracefully without throwing', () => {
    const invalidRes = decodeAtlasTreeBase64('!!!invalid@@@base64%%%');
    expect(invalidRes.isErr()).toBe(true);
    if (invalidRes.isErr()) {
      expect(invalidRes.error.message).toBeTruthy();
    }

    const emptyRes = parseAtlasUrlOrBase64('');
    expect(emptyRes.isErr()).toBe(true);
  });
});
