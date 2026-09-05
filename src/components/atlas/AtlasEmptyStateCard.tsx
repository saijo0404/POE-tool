import React from 'react';
import { Compass, Share2 } from 'lucide-react';
import { Card, Button } from '../ui';

interface AtlasEmptyStateCardProps {
  onCreateStrategy: () => void;
  onOpenCommunityHub?: () => void;
}

export const AtlasEmptyStateCard: React.FC<AtlasEmptyStateCardProps> = ({
  onCreateStrategy,
  onOpenCommunityHub
}) => {
  return (
    <Card
      variant="elevated"
      padding="lg"
      style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
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
        <Button
          variant="primary"
          size="lg"
          onClick={onCreateStrategy}
          icon={<Compass size={17} />}
        >
          + 新增自訂策略
        </Button>

        {onOpenCommunityHub && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onOpenCommunityHub}
            icon={<Share2 size={16} />}
          >
            瀏覽社群精選策略
          </Button>
        )}
      </div>
    </Card>
  );
};
