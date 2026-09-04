import React from 'react';
import { MapPin, Shield, Link2 } from 'lucide-react';

interface StrategyTierFieldsProps {
  mapsInput: string;
  keystonesInput: string;
  atlasTreeUrl: string;
  mechanicNotes: string;
  onChangeMapsInput: (maps: string) => void;
  onChangeKeystonesInput: (keystones: string) => void;
  onChangeAtlasTreeUrl: (url: string) => void;
  onChangeMechanicNotes: (notes: string) => void;
}

export const StrategyTierFields: React.FC<StrategyTierFieldsProps> = ({
  mapsInput,
  keystonesInput,
  atlasTreeUrl,
  mechanicNotes,
  onChangeMapsInput,
  onChangeKeystonesInput,
  onChangeAtlasTreeUrl,
  onChangeMechanicNotes
}) => {
  return (
    <>
      <div>
        <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <MapPin size={14} /> 推薦地圖清單 (Recommended Maps, 逗號分隔)：
        </label>
        <input
          type="text"
          className="poe-input"
          value={mapsInput}
          onChange={e => onChangeMapsInput(e.target.value)}
          placeholder="例如: T16 地圖, T17 地圖, T16 8詞已污染地圖"
          style={{ width: '100%', height: '34px', fontSize: '0.84rem' }}
        />
      </div>

      <div>
        <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <Shield size={14} /> 核心輿圖基石天賦 (Keystones, 逗號分隔)：
        </label>
        <input
          type="text"
          className="poe-input"
          value={keystonesInput}
          onChange={e => onChangeKeystonesInput(e.target.value)}
          placeholder="例如: 第七道門, 不屈之志, 專注單一, 命運扭曲"
          style={{ width: '100%', height: '34px', fontSize: '0.84rem' }}
        />
      </div>

      <div>
        <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <Link2 size={14} /> 輿圖天賦樹網址 / 代碼 (PoEPlanner / 官方網址 / Base64)：
        </label>
        <input
          type="text"
          className="poe-input"
          value={atlasTreeUrl}
          onChange={e => onChangeAtlasTreeUrl(e.target.value)}
          placeholder="https://poeplanner.com/atlas-tree/... 或 官方天賦網址 或 Base64"
          style={{ width: '100%', height: '34px', fontSize: '0.84rem' }}
        />
        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '3px' }}>
          💡 提示：儲存時將自動解析天賦節點並同步至內建輿圖規劃器畫布。
        </div>
      </div>

      <div>
        <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
          刷圖技巧與機制要點說明 (Mechanic Notes)：
        </label>
        <textarea
          className="poe-input"
          value={mechanicNotes}
          onChange={e => onChangeMechanicNotes(e.target.value)}
          rows={2}
          placeholder="例如: 瓦爾寶珠點恐懼/忌妒/傲慢/輕蔑；一鍵引爆避開免疫詞綴..."
          style={{ width: '100%', fontSize: '0.84rem', resize: 'vertical' }}
        />
      </div>
    </>
  );
};
