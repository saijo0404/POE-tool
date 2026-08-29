import { Result } from '../errors/Result';
import { DomainError } from '../errors/DomainError';
import type { AtlasDecodedTree } from './types';
import { ATLAS_NODES_MAP, ATLAS_NODES_BY_NUMID } from './atlasTreeDataset';

// Binary header constants
const TREE_VERSION = 6;

// Convert Uint8Array to URL-safe Base64 string
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Convert URL-safe Base64 string to Uint8Array
function base64UrlToBytes(base64Url: string): Uint8Array | null {
  try {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

// Encode list of node string IDs into PoE standard Base64 string
export function encodeAtlasTreeBase64(nodeIds: string[]): string {
  const numIds: number[] = [];
  nodeIds.forEach(id => {
    const node = ATLAS_NODES_MAP[id] || ATLAS_NODES_BY_NUMID[Number(id)];
    if (node && node.numId) {
      numIds.push(node.numId);
    } else if (Number(id) > 0) {
      numIds.push(Number(id));
    }
  });

  // Header: 4 bytes version + 2 bytes meta + 2 bytes per node
  const bufferLength = 6 + numIds.length * 2;
  const bytes = new Uint8Array(bufferLength);
  bytes[0] = (TREE_VERSION >> 24) & 0xff;
  bytes[1] = (TREE_VERSION >> 16) & 0xff;
  bytes[2] = (TREE_VERSION >> 8) & 0xff;
  bytes[3] = TREE_VERSION & 0xff;
  bytes[4] = 0; // Class
  bytes[5] = 0; // Ascendancy / Fullscreen

  let offset = 6;
  numIds.forEach(numId => {
    bytes[offset] = (numId >> 8) & 0xff;
    bytes[offset + 1] = numId & 0xff;
    offset += 2;
  });

  return bytesToBase64Url(bytes);
}

// Decode Base64 string into node IDs with adaptive multi-format & endianness detection
export function decodeAtlasTreeBase64(
  base64Str: string
): Result<AtlasDecodedTree, DomainError> {
  const trimmed = base64Str.trim();
  if (!trimmed) {
    return Result.err(DomainError.validation('天賦編碼不可為空'));
  }

  const allBytes = base64UrlToBytes(trimmed);
  if (!allBytes || allBytes.length < 6) {
    return Result.err(DomainError.parse('無效的 Base64 輿圖天賦字串'));
  }

  // Detect and truncate GZIP trailer if present (PoEPlanner appends 0x1f, 0x8b stream for masteries/jewels)
  let bytes = allBytes;
  for (let i = 6; i + 1 < allBytes.length; i++) {
    if (allBytes[i] === 0x1f && allBytes[i + 1] === 0x8b) {
      bytes = allBytes.subarray(0, i);
      break;
    }
  }

  const version = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];

  // Candidates for extraction: try (offset 6 vs 7) x (BE vs LE)
  const candidateOffsets = [7, 6, 8, 5];
  let bestCandidate: {
    nodeIds: string[];
    numIds: number[];
    unmatchedNumIds: number[];
  } | null = null;

  for (const offset of candidateOffsets) {
    // Try Little-Endian
    const numIdsLE: number[] = [];
    const nodeIdsLE: string[] = [];
    const unmatchedLE: number[] = [];

    for (let i = offset; i + 1 < bytes.length; i += 2) {
      const numId = (bytes[i + 1] << 8) | bytes[i]; // uint16LE
      if (numId === 0) continue;
      numIdsLE.push(numId);
      const node = ATLAS_NODES_BY_NUMID[numId] || ATLAS_NODES_MAP[String(numId)];
      if (node) {
        nodeIdsLE.push(node.id);
      } else {
        unmatchedLE.push(numId);
      }
    }

    if (!bestCandidate || nodeIdsLE.length > bestCandidate.nodeIds.length) {
      bestCandidate = { nodeIds: nodeIdsLE, numIds: numIdsLE, unmatchedNumIds: unmatchedLE };
    }

    // Try Big-Endian
    const numIdsBE: number[] = [];
    const nodeIdsBE: string[] = [];
    const unmatchedBE: number[] = [];

    for (let i = offset; i + 1 < bytes.length; i += 2) {
      const numId = (bytes[i] << 8) | bytes[i + 1]; // uint16BE
      if (numId === 0) continue;
      numIdsBE.push(numId);
      const node = ATLAS_NODES_BY_NUMID[numId] || ATLAS_NODES_MAP[String(numId)];
      if (node) {
        nodeIdsBE.push(node.id);
      } else {
        unmatchedBE.push(numId);
      }
    }

    if (nodeIdsBE.length > bestCandidate.nodeIds.length) {
      bestCandidate = { nodeIds: nodeIdsBE, numIds: numIdsBE, unmatchedNumIds: unmatchedBE };
    }
  }

  const { nodeIds, numIds, unmatchedNumIds } = bestCandidate || {
    nodeIds: [],
    numIds: [],
    unmatchedNumIds: []
  };

  // Ensure origin 29045 is included if there are allocated nodes
  if (nodeIds.length > 0 && !nodeIds.includes('29045') && !nodeIds.includes('start_origin')) {
    nodeIds.unshift('29045');
  }

  return Result.ok({
    version,
    nodeIds,
    numIds,
    unmatchedNumIds
  });
}

// Extract base64 payload from URL or raw text
export function parseAtlasUrlOrBase64(
  input: string
): Result<AtlasDecodedTree, DomainError> {
  const trimmed = input.trim();
  if (!trimmed) {
    return Result.err(DomainError.validation('輸入網址或編碼為空'));
  }

  let rawPayload = trimmed;
  // If URL like https://poeplanner.com/atlas-tree/BQAc...
  if (trimmed.includes('atlas-tree/') || trimmed.includes('fullscreen-atlas-skill-tree/')) {
    const match = trimmed.match(/(?:atlas-tree|fullscreen-atlas-skill-tree)\/([A-Za-z0-9_\-]+={0,2})/);
    if (match && match[1]) {
      rawPayload = match[1];
    }
  } else if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    rawPayload = parts[parts.length - 1] || parts[parts.length - 2];
  }

  return decodeAtlasTreeBase64(rawPayload);
}

// Generate URL for sharing
export function generateAtlasTreeUrl(
  nodeIds: string[],
  target: 'official' | 'poeplanner' = 'poeplanner'
): string {
  const b64 = encodeAtlasTreeBase64(nodeIds);
  if (target === 'official') {
    return `https://www.pathofexile.com/fullscreen-atlas-skill-tree/${b64}`;
  }
  return `https://poeplanner.com/atlas-tree/${b64}`;
}
