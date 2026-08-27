import type { AtlasNode, AtlasTreeStatsSummary } from './types';

// Calculate aggregated stats, active keystones, and category counts
export function calculateAtlasTreeStats(
  allocatedIds: Set<string>,
  nodes: AtlasNode[]
): AtlasTreeStatsSummary {
  const statsList: string[] = [];
  const activeKeystones: AtlasNode[] = [];
  const categoryCounts: Record<string, number> = {};
  let pointsSpent = 0;

  nodes.forEach(node => {
    if (allocatedIds.has(node.id)) {
      if (node.id !== 'start_origin') {
        pointsSpent += 1;
      }
      if (node.type === 'keystone') {
        activeKeystones.push(node);
      }

      categoryCounts[node.category] = (categoryCounts[node.category] || 0) + 1;

      node.stats.forEach(st => {
        if (!statsList.includes(st) && !st.includes('輿圖探索起點')) {
          statsList.push(st);
        }
      });
    }
  });

  return {
    pointsSpent,
    activeKeystones,
    statsList,
    categoryCounts
  };
}
