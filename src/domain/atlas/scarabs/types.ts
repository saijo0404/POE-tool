export interface ScarabDef {
  id: string;
  name: string; // 繁體中文名稱
  nameEn: string; // 英文名稱 (poe.ninja key)
  category: string;
  limit: number;
  description: string;
  basePriceChaos?: number;
}

export interface PopularExtraItemDef {
  name: string;
  nameEn: string;
  category: 'craft' | 'map' | 'delirium' | 'currency' | 'fragment' | 'other';
  defaultPriceChaos: number;
}
