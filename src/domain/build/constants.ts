export const RARITY_COLORS: Record<string, string> = {
  Normal: '#c8c8c8',
  Magic: '#8888ff',
  Rare: '#ffff77',
  Unique: '#af6025',
  Gem: '#1ba29b',
  Currency: '#aa9e82',
};

export const CONFIDENCE_LABELS: Record<string, { text: string; color: string }> = {
  high: { text: '精確', color: '#22c55e' },
  medium: { text: '估算', color: '#eab308' },
  low: { text: '未定價', color: '#64748b' },
};

export const SLOT_LABELS: Record<string, string> = {
  Helm: '🪖 頭盔',
  BodyArmour: '🛡️ 胸甲',
  Gloves: '🧤 手套',
  Boots: '👢 鞋子',
  Weapon: '⚔️ 武器',
  Weapon2: '⚔️ 副武器',
  Offhand: '🛡️ 副手',
  Offhand2: '🛡️ 副手2',
  Ring: '💍 戒指',
  Ring2: '💍 戒指2',
  Amulet: '📿 項鍊',
  Belt: '🎗️ 腰帶',
};

export const CATEGORY_CONFIG = {
  equipment: { label: '🛡️ 裝備 Equipment', gradient: 'linear-gradient(135deg, #8c7849 0%, #4a3d20 100%)' },
  gems: { label: '💎 寶石 Gems', gradient: 'linear-gradient(135deg, #1ba29b 0%, #0d5854 100%)' },
  flasks: { label: '🧪 藥劑 Flasks', gradient: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)' },
  jewels: { label: '🔮 珠寶 Jewels', gradient: 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)' },
};

export const DIVINE_ICON_URL = 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png';
export const CHAOS_ICON_URL = 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png';
