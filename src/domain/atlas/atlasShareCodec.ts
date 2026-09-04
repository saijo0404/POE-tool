import type { AtlasStrategy, AtlasStrategyTier } from './types';
import { Result } from '../errors/Result';
import { DomainError } from '../errors/DomainError';

const SHARE_CODE_PREFIX = 'POEATLAS-v1-';

function utf8ToBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64url');
  }
  const binary = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p) => String.fromCharCode(parseInt(p, 16)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64ToUtf8(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf-8');
  }
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeAtlasStrategyShareCode(strategy: AtlasStrategy): string {
  const payload = {
    name: strategy.name,
    category: strategy.category,
    description: strategy.description,
    tags: strategy.tags || [],
    tiers: (strategy.tiers || []).map(t => ({
      name: t.name,
      recommendedMaps: t.recommendedMaps || [],
      coreKeystones: t.coreKeystones || [],
      atlasTreeUrl: t.atlasTreeUrl || '',
      scarabs: t.scarabs || [],
      extraItems: t.extraItems || [],
      mechanicNotes: t.mechanicNotes || '',
      allocatedNodes: t.allocatedNodes || []
    }))
  };

  const json = JSON.stringify(payload);
  return `${SHARE_CODE_PREFIX}${utf8ToBase64(json)}`;
}

export function decodeAtlasStrategyShareCode(code: string): Result<AtlasStrategy, DomainError> {
  const trimmed = code.trim();
  if (!trimmed.startsWith(SHARE_CODE_PREFIX)) {
    return Result.err(DomainError.validation('短代碼無效，必須以 POEATLAS-v1- 開頭'));
  }

  const encodedPart = trimmed.slice(SHARE_CODE_PREFIX.length);
  try {
    const json = base64ToUtf8(encodedPart);
    const parsed = JSON.parse(json);

    if (!parsed || !parsed.name || !parsed.category || !Array.isArray(parsed.tiers)) {
      return Result.err(DomainError.validation('短代碼內容結構損壞，缺少必要屬性'));
    }

    const now = Date.now();
    const strategy: AtlasStrategy = {
      id: `community_${now}_${Math.random().toString(36).substring(2, 7)}`,
      name: parsed.name,
      category: parsed.category,
      description: parsed.description || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      tiers: parsed.tiers.map((t: Partial<AtlasStrategyTier>, idx: number) => ({
        id: `tier_${idx + 1}`,
        name: t.name || `T${idx + 1}`,
        recommendedMaps: Array.isArray(t.recommendedMaps) ? t.recommendedMaps : [],
        coreKeystones: Array.isArray(t.coreKeystones) ? t.coreKeystones : [],
        atlasTreeUrl: t.atlasTreeUrl || '',
        scarabs: Array.isArray(t.scarabs) ? t.scarabs : [],
        extraItems: Array.isArray(t.extraItems) ? t.extraItems : [],
        mechanicNotes: t.mechanicNotes || '',
        allocatedNodes: Array.isArray(t.allocatedNodes) ? t.allocatedNodes : []
      })),
      createdAt: now,
      updatedAt: now
    };

    return Result.ok(strategy);
  } catch (err) {
    return Result.err(DomainError.validation(`短代碼解碼失敗: ${(err as Error).message}`));
  }
}
