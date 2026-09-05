import React from 'react';

export type CardVariant = 'default' | 'subtle' | 'elevated' | 'bordered';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  default: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
  },
  subtle: {
    background: 'rgba(16, 20, 30, 0.75)',
    border: '1px solid rgba(200, 170, 110, 0.15)',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
  },
  elevated: {
    background: 'linear-gradient(180deg, #161c2b 0%, #10141e 100%)',
    border: '1px solid var(--border-gold)',
    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.7)',
  },
  bordered: {
    background: '#161b22',
    border: '1px solid #30363d',
    boxShadow: 'none',
  },
};

const paddingStyles: Record<CardPadding, string> = {
  none: '0',
  sm: '10px 14px',
  md: '16px 20px',
  lg: '24px',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className = '',
  style,
  children,
  ...rest
}) => {
  const combinedStyle: React.CSSProperties = {
    borderRadius: '6px',
    position: 'relative',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    padding: paddingStyles[padding],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <div className={`poe-card-primitive ${className}`} style={combinedStyle} {...rest}>
      {children}
    </div>
  );
};
