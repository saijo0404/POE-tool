import React, { useState } from 'react';
import { Filter, Link2, Skull, ShieldCheck, Plus, Trash2, Search, RefreshCw } from 'lucide-react';
import type { ParsedItemMod } from '../../types/poe';

interface AffixFilterListProps {
  mods: ParsedItemMod[];
  tradeStatus?: 'instant' | 'securable' | 'any_buyout' | 'onlineleague' | 'online' | 'any';
  setTradeStatus?: (val: 'instant' | 'securable' | 'any_buyout' | 'onlineleague' | 'online' | 'any') => void;
  linksMin?: number;
  setLinksMin?: (val: number | undefined) => void;
  corruptedFilter?: boolean;
  setCorruptedFilter?: (val: boolean | undefined) => void;
  itemLevelMin?: number;
  setItemLevelMin?: (val: number | undefined) => void;
  onToggleMod: (index: number) => void;
  onChangeMinValue: (index: number, val: number | undefined) => void;
  onChangeMaxValue: (index: number, val: number | undefined) => void;
  formatModText: (mod: ParsedItemMod) => string;
  onAddCustomMod?: (mod: { text: string; englishText?: string; value?: number; minValue?: number; maxValue?: number }) => void;
  onRemoveMod?: (index: number) => void;
  onSearchTrade?: () => void;
  searching?: boolean;
}

const COMMON_STAT_PRESETS = [
  { text: '+# 最大生命', englishText: '+# to Maximum Life', defaultValue: 70 },
  { text: '+#% 全部元素抗性', englishText: '+#% to all Elemental Resistances', defaultValue: 12 },
  { text: '+#% 火焰抗性', englishText: '+#% to Fire Resistance', defaultValue: 35 },
  { text: '+#% 冰冷抗性', englishText: '+#% to Cold Resistance', defaultValue: 35 },
  { text: '+#% 閃電抗性', englishText: '+#% to Lightning Resistance', defaultValue: 35 },
  { text: '+#% 混沌抗性', englishText: '+#% to Chaos Resistance', defaultValue: 25 },
  { text: '增加 #% 移動速度', englishText: '#% increased Movement Speed', defaultValue: 30 },
  { text: '增加 #% 攻擊速度', englishText: '#% increased Attack Speed', defaultValue: 15 },
  { text: '增加 #% 施法速度', englishText: '#% increased Cast Speed', defaultValue: 15 },
  { text: '+#% 暴擊加成', englishText: '+#% to Critical Strike Multiplier', defaultValue: 30 },
  { text: '增加 #% 暴擊率', englishText: '#% increased Critical Strike Chance', defaultValue: 50 },
  { text: '增加 #% 法術傷害', englishText: '#% increased Spell Damage', defaultValue: 60 },
  { text: '增加 #% 物理傷害', englishText: '#% increased Physical Damage', defaultValue: 80 },
  { text: '+# 點能量護盾', englishText: '+# to maximum Energy Shield', defaultValue: 50 },
  { text: '+# 點護甲', englishText: '+# to Armour', defaultValue: 200 }
];

export const AffixFilterList: React.FC<AffixFilterListProps> = ({
  mods,
  tradeStatus,
  setTradeStatus,
  linksMin,
  setLinksMin,
  corruptedFilter,
  setCorruptedFilter,
  itemLevelMin,
  setItemLevelMin,
  onToggleMod,
  onChangeMinValue,
  onChangeMaxValue,
  formatModText,
  onAddCustomMod,
  onRemoveMod,
  onSearchTrade,
  searching = false
}) => {
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [customMinVal, setCustomMinVal] = useState<string>('');

  const handleAddPreset = (preset: typeof COMMON_STAT_PRESETS[0]) => {
    if (onAddCustomMod) {
      onAddCustomMod({
        text: preset.text,
        englishText: preset.englishText,
        value: preset.defaultValue,
        minValue: preset.defaultValue
      });
      setShowAddCustom(false);
    }
  };

  const handleAddManual = () => {
    if (!customText.trim() || !onAddCustomMod) return;
    const min = customMinVal ? Number(customMinVal) : undefined;
    onAddCustomMod({
      text: customText.trim(),
      englishText: customText.trim(),
      value: min,
      minValue: min
    });
    setCustomText('');
    setCustomMinVal('');
    setShowAddCustom(false);
  };

  return (
    <div className="poe-card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="var(--text-gold)" />
          <h3 className="poe-font" style={{ fontSize: '1rem', color: 'var(--text-gold)', margin: 0 }}>
            市集進階篩選與詞綴過濾
          </h3>
        </div>

        {/* Quick filters for Trade Status, Links, Corrupted, iLvl */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Trade Status Official Dropdown (5 Official Options) */}
          {setTradeStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', background: '#090d14', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(200, 170, 110, 0.3)' }}>
              <span style={{ color: 'var(--text-gold)', fontWeight: 600 }}>交易方式:</span>
              <select
                value={tradeStatus || 'instant'}
                onChange={e => setTradeStatus(e.target.value as any)}
                style={{ background: 'transparent', color: '#fff', border: 'none', outline: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                <option value="instant" style={{ background: '#0f141f' }}>Instant Buyout (僅即時直購 - 預設)</option>
                <option value="any_buyout" style={{ background: '#0f141f' }}>Instant Buyout and In Person (直購與親自交易)</option>
                <option value="onlineleague" style={{ background: '#0f141f' }}>In Person (Online in League) (同聯盟在線親自交易)</option>
                <option value="online" style={{ background: '#0f141f' }}>In Person (Online) (所有在線親自交易)</option>
                <option value="any" style={{ background: '#0f141f' }}>Any (全部，包含離線)</option>
              </select>
            </div>
          )}

          {/* Links Quick Toggle */}
          {setLinksMin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', background: '#090d14', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Link2 size={14} color="#38bdf8" />
              <span style={{ color: 'var(--text-muted)' }}>連線:</span>
              <select
                value={linksMin ?? ''}
                onChange={e => setLinksMin(e.target.value === '' ? undefined : Number(e.target.value))}
                style={{ background: 'transparent', color: 'var(--text-gold)', border: 'none', outline: 'none', cursor: 'pointer' }}
              >
                <option value="" style={{ background: '#0f141f' }}>不限</option>
                <option value="6" style={{ background: '#0f141f' }}>6 連 (6-Link)</option>
                <option value="5" style={{ background: '#0f141f' }}>5 連 (5-Link)</option>
              </select>
            </div>
          )}

          {/* Corrupted Quick Toggle */}
          {setCorruptedFilter && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', background: '#090d14', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Skull size={14} color="#ef4444" />
              <span style={{ color: 'var(--text-muted)' }}>汙染:</span>
              <select
                value={corruptedFilter === undefined ? '' : corruptedFilter ? 'yes' : 'no'}
                onChange={e => {
                  if (e.target.value === 'yes') setCorruptedFilter(true);
                  else if (e.target.value === 'no') setCorruptedFilter(false);
                  else setCorruptedFilter(undefined);
                }}
                style={{ background: 'transparent', color: 'var(--text-gold)', border: 'none', outline: 'none', cursor: 'pointer' }}
              >
                <option value="" style={{ background: '#0f141f' }}>不限</option>
                <option value="yes" style={{ background: '#0f141f' }}>已汙染 (Corrupted)</option>
                <option value="no" style={{ background: '#0f141f' }}>未汙染 (Uncorrupted)</option>
              </select>
            </div>
          )}

          {/* Item Level Min */}
          {setItemLevelMin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', background: '#090d14', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <ShieldCheck size={14} color="#4ade80" />
              <span style={{ color: 'var(--text-muted)' }}>物等(iLvl)≥</span>
              <input
                type="number"
                placeholder="無"
                value={itemLevelMin ?? ''}
                onChange={e => setItemLevelMin(e.target.value === '' ? undefined : Number(e.target.value))}
                style={{ width: '45px', background: 'transparent', color: '#4ade80', border: 'none', outline: 'none', textAlign: 'center' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Affix List */}
      {mods.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {mods.map((mod, idx) => {
            const formattedText = formatModText(mod);
            const isSelected = !!mod.enabled;
            const isCustom = mod.id && mod.id.startsWith('custom_');

            return (
              <div
                key={`${mod.id || idx}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: isSelected ? 'rgba(200, 170, 110, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? '1px solid rgba(200, 170, 110, 0.35)' : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleMod(idx)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '0.88rem', color: isSelected ? 'var(--text-gold)' : 'var(--text-main)', lineHeight: 1.4 }}>
                      {formattedText}
                    </span>
                  </label>
                  {isCustom && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', background: 'rgba(56, 189, 248, 0.1)', padding: '1px 6px', borderRadius: '3px' }}>
                      自訂詞綴
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                  {isSelected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min:</span>
                      <input
                        type="number"
                        className="poe-input"
                        style={{ width: '60px', padding: '2px 6px', fontSize: '0.8rem', textAlign: 'center' }}
                        value={mod.minValue ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : Number(e.target.value);
                          onChangeMinValue(idx, val);
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max:</span>
                      <input
                        type="number"
                        className="poe-input"
                        style={{ width: '60px', padding: '2px 6px', fontSize: '0.8rem', textAlign: 'center' }}
                        value={mod.maxValue ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : Number(e.target.value);
                          onChangeMaxValue(idx, val);
                        }}
                      />
                    </div>
                  )}

                  {isCustom && onRemoveMod && (
                    <button
                      type="button"
                      onClick={() => onRemoveMod(idx)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                      title="刪除此自訂詞綴"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Action Bar: Add Custom Affix & Trigger Search */}
      <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          {onAddCustomMod && !showAddCustom && (
            <button
              type="button"
              className="poe-btn"
              onClick={() => setShowAddCustom(true)}
              style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} color="var(--text-gold)" />
              ➕ 新增額外篩選詞綴 (Add Custom Stat Mod)
            </button>
          )}
        </div>

        {onSearchTrade && (
          <button
            type="button"
            className="poe-btn poe-btn-primary"
            onClick={onSearchTrade}
            disabled={searching}
            style={{ fontSize: '0.85rem', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {searching ? <RefreshCw className="animate-spin" size={15} /> : <Search size={15} />}
            {searching ? '查詢中...' : '🔍 依選定詞綴查詢市集'}
          </button>
        )}
      </div>

      {/* Add Custom Affix Form */}
      {onAddCustomMod && showAddCustom && (
        <div style={{ marginTop: '12px', background: '#090d14', padding: '12px', borderRadius: '6px', border: '1px solid rgba(200, 170, 110, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 600 }}>
              選擇常用熱門詞綴或手動輸入：
            </span>
            <button
              type="button"
              onClick={() => setShowAddCustom(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              取消
            </button>
          </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {COMMON_STAT_PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-bright)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    + {preset.text} ({preset.defaultValue})
                  </button>
                ))}
              </div>

              {/* Manual Input */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="poe-input"
                  placeholder="自訂詞綴名稱 (例如: +# 最大魔力 或 法術暴擊)..."
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  style={{ flex: 1, fontSize: '0.82rem' }}
                />
                <input
                  type="number"
                  className="poe-input"
                  placeholder="Min"
                  value={customMinVal}
                  onChange={e => setCustomMinVal(e.target.value)}
                  style={{ width: '65px', fontSize: '0.82rem', textAlign: 'center' }}
                />
                <button
                  type="button"
                  className="poe-btn poe-btn-primary"
                  onClick={handleAddManual}
                  disabled={!customText.trim()}
                  style={{ padding: '6px 12px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                >
                  確認新增
                </button>
              </div>
            </div>
          )}
    </div>
  );
};

export default AffixFilterList;

