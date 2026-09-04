import type { AtlasNode, AtlasNodeType } from './types';
import { OFFICIAL_ORBIT_RADII, getNodeAngleDeg } from './atlasOrbitGeometry';
import { KEYSTONE_TRANSLATIONS } from './atlasNodeTranslations';
import { detectMechanicCategory } from './atlasMechanicDetector';

export interface RawGggNodeGroup {
  x: number;
  y: number;
  orbits?: number[];
  nodes?: (string | number)[];
}

export interface RawGggNode {
  skill?: number;
  name?: string;
  icon?: string;
  isKeystone?: boolean;
  isNotable?: boolean;
  stats?: string[];
  reminderText?: string[];
  group?: number | string;
  orbit?: number;
  orbitIndex?: number;
  out?: (string | number)[];
  in?: (string | number)[];
}

export interface RawGggAtlasTreeData {
  tree?: string;
  groups: Record<string, RawGggNodeGroup>;
  nodes: Record<string, RawGggNode>;
}

function computeNodePosition(
  rawNode: RawGggNode,
  group: RawGggNodeGroup,
  scaleFactor: number
): { x: number; y: number } {
  const orbit = rawNode.orbit ?? 0;
  const orbitIndex = rawNode.orbitIndex ?? 0;
  const radius = OFFICIAL_ORBIT_RADII[orbit] ?? 0;
  const rad = (getNodeAngleDeg(orbit, orbitIndex) * Math.PI) / 180;
  const rawX = group.x + radius * Math.sin(rad);
  const rawY = group.y - radius * Math.cos(rad);
  return {
    x: Math.round(rawX * scaleFactor * 10) / 10,
    y: Math.round(rawY * scaleFactor * 10) / 10
  };
}

function resolveNodeType(rawNode: RawGggNode, nodeIdStr: string): AtlasNodeType {
  if (rawNode.isKeystone) return 'keystone';
  if (rawNode.isNotable) return 'notable';
  if (nodeIdStr === '29045') return 'start';
  return 'small';
}

function resolveNodeNames(rawNode: RawGggNode, nodeIdStr: string): { name: string; nameEn: string } {
  let nameEn = rawNode.name || '';
  if (!nameEn && nodeIdStr === '29045') {
    nameEn = 'Atlas Origin';
  } else if (!nameEn) {
    nameEn = `Atlas Node ${nodeIdStr}`;
  }
  let name = KEYSTONE_TRANSLATIONS[nameEn] || nameEn;
  if (nodeIdStr === '29045') {
    name = '輿圖起點 (Atlas Origin)';
  }
  return { name, nameEn };
}

function parseSingleGggNode(
  nodeIdStr: string,
  rawNode: RawGggNode,
  groups: Record<string, RawGggNodeGroup>,
  scaleFactor: number
): AtlasNode | null {
  if (nodeIdStr === 'root' || !rawNode) return null;
  const group = groups[String(rawNode.group)];
  if (!group) return null;

  const { x, y } = computeNodePosition(rawNode, group, scaleFactor);
  const { name, nameEn } = resolveNodeNames(rawNode, nodeIdStr);
  const stats = Array.isArray(rawNode.stats) ? rawNode.stats : [];
  const connections = Array.from(new Set([...(rawNode.out || []), ...(rawNode.in || [])].map(String)));

  return {
    id: String(nodeIdStr),
    numId: Number(rawNode.skill || nodeIdStr) || Number(nodeIdStr) || 0,
    name,
    nameEn,
    type: resolveNodeType(rawNode, nodeIdStr),
    category: detectMechanicCategory(nameEn, stats, rawNode.icon),
    description: rawNode.reminderText ? rawNode.reminderText.join('\n') : '',
    stats,
    x,
    y,
    connections,
    icon: rawNode.icon || (nodeIdStr === '29045' ? '🏛️' : undefined)
  };
}

/**
 * Parses raw official GGG Atlas Tree JSON and transforms into 1:1 AtlasNode[]
 */
export function parseOfficialGggData(rawGggJson: unknown, scaleFactor: number = 0.22): AtlasNode[] {
  if (!rawGggJson || typeof rawGggJson !== 'object' || !('groups' in rawGggJson) || !('nodes' in rawGggJson)) {
    throw new Error('無效的 GGG 官方輿圖天賦 JSON 格式');
  }

  const gggData = rawGggJson as RawGggAtlasTreeData;
  const parsedNodes: AtlasNode[] = [];

  for (const [nodeIdStr, rawNode] of Object.entries(gggData.nodes)) {
    const node = parseSingleGggNode(nodeIdStr, rawNode, gggData.groups, scaleFactor);
    if (node) {
      parsedNodes.push(node);
    }
  }

  return parsedNodes;
}
