import { describe, it, expect } from 'vitest';
import {
  encodeAtlasTreeBase64,
  decodeAtlasTreeBase64,
  parseAtlasUrlOrBase64,
  generateAtlasTreeUrl
} from '../atlasTreeEncoder';
import { ATLAS_TREE_NODES_DATA } from '../atlasTreeDataset';

describe('atlasTreeEncoder', () => {
  it('encodes and decodes node IDs in roundtrip', () => {
    const sampleNodes = [ATLAS_TREE_NODES_DATA[0].id, ATLAS_TREE_NODES_DATA[1].id, ATLAS_TREE_NODES_DATA[2].id];
    const encoded = encodeAtlasTreeBase64(sampleNodes);
    expect(encoded).toBeTruthy();
    expect(typeof encoded).toBe('string');

    const decodeResult = decodeAtlasTreeBase64(encoded);
    expect(decodeResult.isOk()).toBe(true);
    if (decodeResult.isOk()) {
      const decoded = decodeResult.value;
      sampleNodes.forEach(id => {
        expect(decoded.nodeIds).toContain(id);
      });
    }
  });

  it('parses official PoE atlas tree URL', () => {
    const sampleNodes = [ATLAS_TREE_NODES_DATA[0].id, ATLAS_TREE_NODES_DATA[1].id];
    const b64 = encodeAtlasTreeBase64(sampleNodes);
    const officialUrl = `https://www.pathofexile.com/fullscreen-atlas-skill-tree/${b64}`;

    const res = parseAtlasUrlOrBase64(officialUrl);
    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.nodeIds).toContain(sampleNodes[1]);
    }
  });

  it('parses PoEPlanner atlas tree URL', () => {
    const sampleNodes = [ATLAS_TREE_NODES_DATA[2].id, ATLAS_TREE_NODES_DATA[3].id];
    const b64 = encodeAtlasTreeBase64(sampleNodes);
    const poePlannerUrl = `https://poeplanner.com/atlas-tree/${b64}`;

    const res = parseAtlasUrlOrBase64(poePlannerUrl);
    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.nodeIds).toContain(sampleNodes[0]);
    }
  });

  it('generates URLs for official PoE and poeplanner', () => {
    const sampleNodes = [ATLAS_TREE_NODES_DATA[1].id];
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
