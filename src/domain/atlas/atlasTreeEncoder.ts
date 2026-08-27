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
    const node = ATLAS_NODES_MAP[id];
    if (node && node.numId) {
      numIds.push(node.numId);
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

// Decode Base64 string into node IDs
export function decodeAtlasTreeBase64(
  base64Str: string
): Result<AtlasDecodedTree, DomainError> {
  const trimmed = base64Str.trim();
  if (!trimmed) {
    return Result.err(DomainError.validation('天賦編碼不可為空'));
  }

  const bytes = base64UrlToBytes(trimmed);
  if (!bytes || bytes.length < 6) {
    return Result.err(DomainError.parse('無效的 Base64 輿圖天賦字串'));
  }

  const version = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
  const numIds: number[] = [];
  const nodeIds: string[] = [];
  const unmatchedNumIds: number[] = [];

  for (let i = 6; i + 1 < bytes.length; i += 2) {
    const numId = (bytes[i] << 8) | bytes[i + 1];
    numIds.push(numId);
    const node = ATLAS_NODES_BY_NUMID[numId];
    if (node) {
      nodeIds.push(node.id);
    } else {
      unmatchedNumIds.push(numId);
    }
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
  if (trimmed.includes('/')) {
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
