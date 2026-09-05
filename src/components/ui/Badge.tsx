import React from 'react';

export type BadgeVariant =
  | 'gold'
  | 'blue'
  | 'green'
  | 'red'
  | 'purple'
  | 'gray'
  | 'currency'
  | 'unique';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  gold: {
    background: 'rgba(200, 170, 110, 0.15)',
    color: 'var(--text-gold)',
    border: '1px solid rgba(200, 170, 110, 0.35)',
  },
  blue: {
    background: 'rgba(56, 189, 248, 0.15)',
    color: 'var(--accent-blue)',
    border: '1px solid rgba(56, 189, 248, 0.35)',
  },
  green: {
    background: 'rgba(34, 197, 94, 0.15)',
    color: 'var(--accent-green)',
    border: '1px solid rgba(34, 197, 94, 0.35)',
  },
  red: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: 'var(--accent-red)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
  },
  purple: {
    background: 'rgba(168, 85, 247, 0.15)',
    color: 'var(--accent-purple)',
    border: '1px solid rgba(168, 85, 247, 0.35)',
  },
  gray: {
    background: 'rgba(148, 163, 184, 0.12)',
    color: 'var(--text-muted)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
  },
  currency: {
    background: 'rgba(170, 158, 130, 0.15)',
    color: 'var(--rarity-currency)',
    border: '1px solid rgba(170, 158, 130, 0.35)',
  },
  unique: {
    background: 'rgba(175, 96, 37, 0.15)',
    color: 'var(--rarity-unique)',
    border: '1px solid rgba(175, 96, 37, 0.35)',
  },
};

const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
  sm: { fontSize: '0.72rem', padding: '2px 6px' },
  md: { fontSize: '0.8rem', padding: '3px 9px' },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gold',
  size = 'md',
  className = '',
  style,
  children,
  ...rest
}) => {
  const combinedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: 600,
    borderRadius: '4px',
    lineHeight: 1.2,
    letterSpacing: '0.3px',
    userSelect: 'none',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <span className={`poe-badge-primitive ${className}`} style={combinedStyle} {...rest}>
      {children}
    </span>
  );
};
