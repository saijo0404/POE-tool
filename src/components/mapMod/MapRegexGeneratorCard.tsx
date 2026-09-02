import React from 'react';
import { Terminal, Copy, Check, AlertTriangle, Filter, Globe } from 'lucide-react';
import type { MapRegexOptions, MapRegexResult } from '../../domain/mapMod/types';
import { MAP_DANGER_MODS } from '../../domain/mapMod/dangerPresets';

interface MapRegexGeneratorCardProps {
  options: MapRegexOptions;
  result: MapRegexResult;
  copied: boolean;
  onUpdateOptions: (patch: Partial<MapRegexOptions>) => void;
  onCopy: () => void;
}

export const MapRegexGeneratorCard: React.FC<MapRegexGeneratorCardProps> = ({
  options,
  result,
  copied,
  onUpdateOptions,
  onCopy
}) => {
  const isZh = options.language === 'zh';

  return (
    <div className="poe-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="var(--text-gold)" /> PoE 倉庫/市集超短 Regex 產生器
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={14} color="var(--text-muted)" />
          <select
            className="poe-input"
            value={options.language}
            onChange={e => onUpdateOptions({ language: e.target.value as 'zh' | 'en' })}
            style={{ padding: '3px 8px', fontSize: '0.78rem' }}
          >
            <option value="zh">繁體中文 (台服/國際中)</option>
            <option value="en">English (Global Client)</option>
          </select>
        </div>
      </div>

      {/* Numeric Sliders for Quality, Quantity, Pack Size */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>物品數量 (Quantity)</span>
            <span style={{ color: 'var(--text-gold)', fontWeight: 'bold' }}>&ge; {options.minQuantity ?? 0}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={options.minQuantity ?? 0}
            onChange={e => onUpdateOptions({ minQuantity: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: 'var(--text-gold)' }}
          />
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>怪群規模 (Pack Size)</span>
            <span style={{ color: 'var(--text-gold)', fontWeight: 'bold' }}>&ge; {options.minPackSize ?? 0}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="45"
            step="5"
            value={options.minPackSize ?? 0}
            onChange={e => onUpdateOptions({ minPackSize: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: 'var(--text-gold)' }}
          />
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>地圖品質 (Quality)</span>
            <span style={{ color: 'var(--text-gold)', fontWeight: 'bold' }}>&ge; {options.minQuality ?? 0}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="5"
            value={options.minQuality ?? 0}
            onChange={e => onUpdateOptions({ minQuality: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: 'var(--text-gold)' }}
          />
        </div>
      </div>

      {/* Excluded Mods Selector */}
      <div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Filter size={13} color="var(--text-gold)" /> 勾選要排除 (Exclude) 的致命詞綴：
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {MAP_DANGER_MODS.map(def => {
            const isExcluded = (options.excludeModIds || []).includes(def.id);
            return (
              <button
                key={def.id}
                type="button"
                onClick={() => {
                  const current = options.excludeModIds || [];
                  const next = current.includes(def.id) ? current.filter(id => id !== def.id) : [...current, def.id];
                  onUpdateOptions({ excludeModIds: next });
                }}
                className={isExcluded ? 'poe-button' : 'poe-button-secondary'}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  borderRadius: '4px',
                  borderColor: isExcluded ? '#e55039' : undefined,
                  background: isExcluded ? 'rgba(229, 80, 57, 0.25)' : undefined
                }}
              >
                {isExcluded ? '❌ ' : ''}{isZh ? def.nameZh : def.nameEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Generated Regex Output Box */}
      <div style={{ background: '#0d1017', border: '1px solid rgba(200, 170, 110, 0.35)', borderRadius: '6px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
            生成的遊戲內搜尋字串 (PoE Search Regex)：
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: '4px',
              background: result.isWithinLimit ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
              color: result.isWithinLimit ? '#2ecc71' : '#e74c3c',
              border: `1px solid ${result.isWithinLimit ? '#2ecc7144' : '#e74c3c44'}`
            }}
          >
            長度：{result.length} / 50 字元 {result.isWithinLimit ? '✅ 符合遊戲限制' : '⚠️ 超過 50 字元'}
          </span>
        </div>

        <div style={{
          background: '#07090e',
          padding: '12px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          color: '#f3d179',
          wordBreak: 'break-all',
          minHeight: '24px',
          border: '1px dashed rgba(255, 255, 255, 0.1)'
        }}>
          {result.regexString || <span style={{ color: 'var(--text-muted)' }}>尚未選擇任何過濾條件</span>}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            💡 複製後在遊戲內倉庫搜尋列按 Ctrl+V 貼上即可高亮符合地圖
          </span>
          <button
            type="button"
            className="poe-button"
            onClick={onCopy}
            disabled={!result.regexString}
            style={{ padding: '8px 18px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copied ? <Check size={15} color="#2ecc71" /> : <Copy size={15} />}
            {copied ? '已複製到剪貼簿！' : '一鍵複製 Regex'}
          </button>
        </div>

        {/* Split Regex Parts when exceeding limit */}
        {!result.isWithinLimit && result.subRegexes && result.subRegexes.length > 0 && (
          <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)', borderRadius: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e74c3c', fontSize: '0.78rem', fontWeight: 'bold', marginBottom: '6px' }}>
              <AlertTriangle size={14} /> 因超過遊戲 50 字元限制，為您自動拆分為以下短字串（可分段篩選）：
            </div>
            {result.subRegexes.map((sub, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontFamily: 'monospace', color: '#f3d179', padding: '3px 0' }}>
                <span>分段 {idx + 1} ({sub.length} 字元): <code>{sub}</code></span>
                <button
                  type="button"
                  className="poe-button-secondary"
                  onClick={() => navigator.clipboard.writeText(sub)}
                  style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                >
                  複製
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
