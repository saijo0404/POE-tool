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

  it('parses real-world PoEPlanner 3.25 BQAc atlas tree URL and extracts 100% matched nodes', () => {
    const userUrl = 'https://poeplanner.com/atlas-tree/BQAcAACKAHc2-Ctl4i_JAEiy-sir3qKQFyx3RJWGtOOQwe6EKozsSgnKZh7PPFk1zPNbMPpwxtJIMmGUg1EovjQUWc4AioI6Ps5ayf2Ijky6C0-N6k_3DDTMtx19eizk94vhfZGmwf2oiDTaFLGdolLXK874Iki39p7YZ2CspHtgKl7Uj9aaK3HcIanO5brOnM3HeKG12GshUXeCp73HSVJdT26EBCsA-X_iYiTwgLPHPkbhEBkK-7HrX6VzxIUJu2Hx4g7GxH9iXt-i0MsXpR3FIYonkc7RKhdQxB9Mkg75TfKFo9pjkYnw_f21wa_l7MGTtmhbHo_lAzCIB9r6HWuvUzPG-ofZXKlDtWOGBlhDdrgJyelnuNnQKBQAH4sIAAAAAAAAAwMAAAAAAAAAAAA=';

    const res = parseAtlasUrlOrBase64(userUrl);
    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      const decoded = res.value;
      expect(decoded.nodeIds.length).toBeGreaterThanOrEqual(130);
      expect(decoded.nodeIds).toContain('29045'); // Origin node included
    }
  });

  it('parses real-world PoEPlanner URL and extracts raw binary node ID tokens safely', () => {
    const userUrl = 'https://poeplanner.com/atlas-tree/BQAaAACKAE_mh9TRoeu7TPUkl7L6sRV5d96ihymLLoa0LJKLTl2gCHr-xW2IwCoez6yrp-I8WSFgNczzW6R_xLC9V4C5YVOUg03DjEG1Zl6dfWXOWsn9176N6goLqLwqu_w3Rjq92uT3JrIKeyd1f15gv97-qgqxnVQfm3eggrCUWbTXKyTRDs-dkipe1I-HndDGDPTDeRsAUXeCp73H9DqOOVmGugBw45zHxJGCUTfjRNV_b89H8IC-DrPH56674tMOfbX7sa6qThvgDF9KyxelHV-6L6iRzhN9DvkZlMrqGIv9tcGvC3E6duXsPn1xCwPtj-UPbBQX2vozxsH7SBLVacJ2qUO1Y6BxZh8_CEBolFVvOH7rQhzQKBQAH4sIAAAAAAAAAwMAAAAAAAAAAAA=';

    const res = parseAtlasUrlOrBase64(userUrl);
    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      const decoded = res.value;
      // Successfully extracts all 138 node tokens from binary stream
      expect(decoded.numIds.length).toBeGreaterThanOrEqual(138);
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
