import React from 'react';
import { Shield, Share2, RefreshCw } from 'lucide-react';
import type { BuildCostResult } from '../../domain/build/types';
import { CATEGORY_CONFIG, DIVINE_ICON_URL } from '../../domain/build/constants';
import { getImageUrl } from '../../utils/image';
import { Card, Button } from '../ui';

interface BuildHeaderCardProps {
  costResult: BuildCostResult;
  onExportMarkdown: () => void;
  onSyncAll?: () => void;
  syncingAll?: boolean;
  syncProgress?: { current: number; total: number } | null;
}

export const BuildHeaderCard: React.FC<BuildHeaderCardProps> = ({
  costResult,
  onExportMarkdown,
  onSyncAll,
  syncingAll,
  syncProgress
}) => {
  const c = costResult.character;
  const categories = costResult.categories;

  return (
    <Card variant="default" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Shield size={20} color="var(--text-gold)" />
            <h2 className="poe-font" style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-gold)' }}>
              {c.name}
            </h2>
            <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(200, 170, 110, 0.15)', color: 'var(--text-gold)', border: '1px solid rgba(200, 170, 110, 0.3)' }}>
              Lv.{c.level} {c.ascendancy || c.class}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            聯盟：<strong style={{ color: 'var(--text-bright)' }}>{c.league}</strong> · 帳號：{c.account || 'PoB'} · 匯率基準：1 div = {costResult.divineChaosRate} c
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {onSyncAll && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSyncAll}
              disabled={syncingAll}
              icon={<RefreshCw size={14} className={syncingAll ? 'spin' : ''} />}
              title="一鍵連線官方市集同步所有物品即時現貨價"
            >
              {syncingAll ? `同步中 (${syncProgress?.current}/${syncProgress?.total})` : '一鍵同步官方現貨'}
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={onExportMarkdown}
            icon={<Share2 size={14} />}
            title="複製 Markdown 造價報表"
          >
            複製報表
          </Button>

          <div style={{ textAlign: 'right', marginLeft: '6px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>總造價預估</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-gold)', fontFamily: 'Cinzel, serif', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src={getImageUrl(DIVINE_ICON_URL)} alt="div" style={{ width: '18px', height: '18px' }} />
              {costResult.totalDivine.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>div</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 'normal', fontFamily: 'sans-serif' }}>
                ({costResult.totalChaos.toLocaleString()} c)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        {(['equipment', 'jewels', 'flasks', 'gems'] as const).map(catKey => {
          const cat = categories[catKey];
          const cfg = CATEGORY_CONFIG[catKey];
          return (
            <div
              key={catKey}
              style={{
                padding: '10px 14px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '4px'
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cfg.label} ({cat.items.length})</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--text-bright)', fontFamily: 'Cinzel, serif' }}>
                {cat.totalDivine.toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--text-gold)' }}>div</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{cat.totalChaos.toLocaleString()} c</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
