import React from 'react';
import type { GameEngine } from '../../domain/engine/types';
import { getEngineBadgeInfo } from '../../domain/engine/capabilities';

export interface EngineBadgeProps {
  readonly supportedEngines?: readonly GameEngine[];
  readonly variant?: 'poe1' | 'poe2' | 'both';
  readonly size?: 'xs' | 'sm' | 'md';
  readonly showBoth?: boolean;
}

const BADGE_STYLES = {
  poe1: {
    color: '#e5c158',
    backgroundColor: 'rgba(229, 193, 88, 0.12)',
    borderColor: 'rgba(229, 193, 88, 0.35)'
  },
  poe2: {
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.35)'
  },
  both: {
    color: '#34d399',
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.35)'
  }
} as const;

const FONT_SIZES = {
  xs: { fontSize: '0.65rem', padding: '1px 5px' },
  sm: { fontSize: '0.72rem', padding: '2px 6px' },
  md: { fontSize: '0.8rem', padding: '3px 8px' }
} as const;

export const EngineBadge: React.FC<EngineBadgeProps> = ({
  supportedEngines,
  variant: propVariant,
  size = 'xs',
  showBoth = false
}) => {
  const info = supportedEngines ? getEngineBadgeInfo(supportedEngines) : null;
  const variant = propVariant ?? info?.variant ?? 'both';
  const label = info?.label ?? (variant === 'poe1' ? 'PoE 1' : variant === 'poe2' ? 'PoE 2' : '雙版本');

  if (variant === 'both' && !showBoth) {
    return null;
  }

  const styleConfig = BADGE_STYLES[variant];
  const sizeConfig = FONT_SIZES[size];

  return (
    <span
      data-testid={`engine-badge-${variant}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '3px',
        borderWidth: '1px',
        borderStyle: 'solid',
        fontWeight: 600,
        letterSpacing: '0.5px',
        lineHeight: 1.2,
        userSelect: 'none',
        ...styleConfig,
        ...sizeConfig
      }}
    >
      {label}
    </span>
  );
};
