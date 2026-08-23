export interface TooltipTheme {
  borderColor: string;
  titleColor: string;
  headerBg: string;
  glowColor: string;
}

export function getRarityTheme(r?: string): TooltipTheme {
  const rarity = (r || 'Rare').toLowerCase();
  if (rarity.includes('unique') || rarity.includes('傳奇')) {
    return {
      borderColor: '#af6025',
      titleColor: '#af6025',
      headerBg: 'linear-gradient(180deg, rgba(60, 25, 5, 0.95) 0%, rgba(30, 12, 3, 0.9) 100%)',
      glowColor: 'rgba(175, 96, 37, 0.3)'
    };
  }
  if (rarity.includes('magic') || rarity.includes('魔法')) {
    return {
      borderColor: '#6b7fff',
      titleColor: '#8888ff',
      headerBg: 'linear-gradient(180deg, rgba(15, 20, 60, 0.95) 0%, rgba(8, 10, 30, 0.9) 100%)',
      glowColor: 'rgba(107, 127, 255, 0.25)'
    };
  }
  if (rarity.includes('currency') || rarity.includes('通貨')) {
    return {
      borderColor: '#aa9e82',
      titleColor: '#aa9e82',
      headerBg: 'linear-gradient(180deg, rgba(40, 35, 30, 0.95) 0%, rgba(20, 18, 15, 0.9) 100%)',
      glowColor: 'rgba(170, 158, 130, 0.2)'
    };
  }
  if (rarity.includes('gem') || rarity.includes('寶石')) {
    return {
      borderColor: '#1ba29b',
      titleColor: '#1ba29b',
      headerBg: 'linear-gradient(180deg, rgba(10, 45, 42, 0.95) 0%, rgba(5, 25, 22, 0.9) 100%)',
      glowColor: 'rgba(27, 162, 155, 0.25)'
    };
  }
  return {
    borderColor: '#c8aa6e',
    titleColor: '#f3d179',
    headerBg: 'linear-gradient(180deg, rgba(45, 35, 15, 0.95) 0%, rgba(20, 16, 8, 0.9) 100%)',
    glowColor: 'rgba(200, 170, 110, 0.25)'
  };
}
