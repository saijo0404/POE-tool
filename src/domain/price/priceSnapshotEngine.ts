import { Result } from '../errors/Result';
import { DomainError } from '../errors/DomainError';

export interface PriceSnapshotItem {
  id: string;
  name: string;
  nameZh: string;
  category: string;
  chaosValue: number;
  divineValue?: number;
  sparkline?: number[];
}

export interface PriceSnapshot {
  version: number;
  league: string;
  timestamp: number;
  divinePriceChaos: number;
  items: PriceSnapshotItem[];
  itemCount: number;
  source: 'auto_sync' | 'manual_export';
}

export interface SnapshotFreshness {
  ageHours: number;
  isStale: boolean;
  relativeTimeText: string;
  statusBadgeText: string;
}

export function createPriceSnapshot(params: {
  league: string;
  divinePriceChaos: number;
  items: PriceSnapshotItem[];
  source?: 'auto_sync' | 'manual_export';
  timestamp?: number;
}): PriceSnapshot {
  const items = params.items || [];
  return {
    version: 1,
    league: params.league,
    timestamp: params.timestamp ?? Date.now(),
    divinePriceChaos: params.divinePriceChaos || 150,
    items,
    itemCount: items.length,
    source: params.source ?? 'auto_sync'
  };
}

function formatRelativeTime(diffMs: number): string {
  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 1) return '剛剛';
  if (minutes < 60) return `${minutes} 分鐘前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

export function evaluateSnapshotFreshness(
  snapshot: PriceSnapshot,
  currentTime: number = Date.now()
): SnapshotFreshness {
  const diffMs = Math.max(0, currentTime - snapshot.timestamp);
  const ageHours = Math.floor(diffMs / (60 * 60 * 1000));
  const isStale = ageHours >= 24;
  const relativeTimeText = formatRelativeTime(diffMs);

  let statusBadgeText: string;
  if (ageHours < 4) {
    statusBadgeText = `🟢 最新快照 (${relativeTimeText})`;
  } else if (ageHours < 24) {
    statusBadgeText = `🟡 稍舊快照 (${relativeTimeText})`;
  } else {
    statusBadgeText = `🔴 陳舊快照 (${relativeTimeText}，建議重新同步)`;
  }

  return {
    ageHours,
    isStale,
    relativeTimeText,
    statusBadgeText
  };
}

export function serializePriceSnapshot(snapshot: PriceSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export function deserializePriceSnapshot(json: string): Result<PriceSnapshot, DomainError> {
  try {
    const parsed = JSON.parse(json);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.league ||
      typeof parsed.timestamp !== 'number' ||
      !Array.isArray(parsed.items)
    ) {
      return Result.err(DomainError.validation('物價快照資料結構無效，缺少 league、timestamp 或 items'));
    }

    const snapshot: PriceSnapshot = {
      version: parsed.version || 1,
      league: String(parsed.league),
      timestamp: parsed.timestamp,
      divinePriceChaos: Number(parsed.divinePriceChaos) || 150,
      items: parsed.items,
      itemCount: parsed.items.length,
      source: parsed.source === 'manual_export' ? 'manual_export' : 'auto_sync'
    };

    return Result.ok(snapshot);
  } catch (err) {
    return Result.err(DomainError.validation(`物價快照反序列化解析失敗: ${(err as Error).message}`));
  }
}

export function querySnapshotPrice(
  snapshot: PriceSnapshot,
  queryName: string
): PriceSnapshotItem | null {
  const cleanQuery = queryName.trim().toLowerCase();
  if (!cleanQuery) return null;

  return (
    snapshot.items.find(
      it =>
        it.name.toLowerCase() === cleanQuery ||
        it.nameZh.toLowerCase() === cleanQuery ||
        it.name.toLowerCase().includes(cleanQuery) ||
        it.nameZh.toLowerCase().includes(cleanQuery)
    ) ?? null
  );
}
