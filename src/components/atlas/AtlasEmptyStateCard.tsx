import React from 'react';
import { Compass, Share2 } from 'lucide-react';

interface AtlasEmptyStateCardProps {
  onCreateStrategy: () => void;
  onOpenCommunityHub?: () => void;
}

export const AtlasEmptyStateCard: React.FC<AtlasEmptyStateCardProps> = ({
  onCreateStrategy,
  onOpenCommunityHub
}) => {
  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(27, 36, 52, 0.6) 0%, rgba(16, 22, 34, 0.8) 100%)',
      border: '1px solid rgba(200, 170, 110, 0.3)',
      borderRadius: '8px',
      padding: '48px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f3d179 0%, #8c7849 70%, #2a2216 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 20px rgba(243, 209, 121, 0.4)'
      }}>
        <Compass size={36} color="#0d121c" />
      </div>

      <h2 className="poe-font" style={{ fontSize: '1.4rem', color: 'var(--text-gold)', margin: '4px 0 0 0' }}>
        目前尚未建立任何輿圖策略 (No Strategies Configured)
      </h2>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '560px', margin: 0, lineHeight: 1.6 }}>
        您的輿圖策略庫目前為空。您可以自由建立全新的自訂刷圖配置、聖甲蟲與輿圖分級規劃，或從社群策略中心挑選熱門流派。
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
        <button
          type="button"
          className="poe-button"
          onClick={onCreateStrategy}
          style={{ padding: '10px 20px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Compass size={17} /> + 新增自訂策略
        </button>

        {onOpenCommunityHub && (
          <button
            type="button"
            className="poe-button-secondary"
            onClick={onOpenCommunityHub}
            style={{ padding: '10px 20px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Share2 size={16} color="var(--text-gold)" /> 瀏覽社群精選策略
          </button>
        )}
      </div>
    </div>
  );
};
