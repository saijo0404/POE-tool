import React from 'react';
import { Badge, type BadgeVariant } from './Badge';

export interface StatBadgeProps {
  label: string;
  value: string | number;
  unit?: string;
  variant?: BadgeVariant;
  className?: string;
  style?: React.CSSProperties;
}

export const StatBadge: React.FC<StatBadgeProps> = ({
  label,
  value,
  unit,
  variant = 'gold',
  className = '',
  style,
}) => {
  return (
    <Badge variant={variant} className={className} style={{ gap: '6px', ...style }}>
      <span style={{ opacity: 0.75, fontWeight: 500 }}>{label}:</span>
      <span style={{ fontWeight: 700 }}>
        {value}
        {unit && <span style={{ marginLeft: '2px', fontSize: '0.9em', opacity: 0.85 }}>{unit}</span>}
      </span>
    </Badge>
  );
};
