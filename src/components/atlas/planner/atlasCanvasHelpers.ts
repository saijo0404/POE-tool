import type { AtlasNode } from '../../../domain/atlas/types';

export const CATEGORY_COLORS: Record<string, string> = {
  essence: '#38bdf8',
  ambush: '#f59e0b',
  harvest: '#22c55e',
  expedition: '#ef4444',
  legion: '#a855f7',
  delirium: '#94a3b8',
  ritual: '#dc2626',
  breach: '#8b5cf6',
  beyond: '#e11d48',
  blight: '#ea580c',
  scarab: '#ec4899',
  boss: '#eab308',
  map: '#67e8f9',
  bestiary: '#14b8a6',
  torment: '#2dd4bf',
  general: '#f3d179',
  custom: '#a78bfa'
};

export function isNodeMatching(node: AtlasNode, selectedCategory: string, searchQuery: string): boolean {
  if (selectedCategory !== 'all' && node.category !== selectedCategory) return false;
  if (!searchQuery.trim()) return true;
  const q = searchQuery.toLowerCase().trim();
  return (
    node.name.toLowerCase().includes(q) ||
    node.nameEn.toLowerCase().includes(q) ||
    node.description.toLowerCase().includes(q) ||
    node.stats.some(s => s.toLowerCase().includes(q))
  );
}

export function getNodeFill(node: AtlasNode, isAlloc: boolean, isPreview: boolean, isMatch: boolean): string {
  if (node.type === 'start') return 'url(#originGrad)';
  if (node.type === 'keystone') return isAlloc ? 'url(#keystoneAllocGrad)' : isPreview ? '#0284c7' : 'url(#keystoneUnallocGrad)';
  if (isAlloc) return CATEGORY_COLORS[node.category] || '#f3d179';
  if (isPreview) return '#0284c7';
  return isMatch ? '#334155' : '#1e293b';
}
