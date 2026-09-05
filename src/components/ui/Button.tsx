import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(180deg, #9a8352 0%, #68532b 100%)',
    border: '1px solid var(--border-gold)',
    color: '#ffffff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
  },
  secondary: {
    background: 'linear-gradient(180deg, #1f2533 0%, #121620 100%)',
    border: '1px solid rgba(200, 170, 110, 0.35)',
    color: 'var(--text-gold)',
  },
  danger: {
    background: 'linear-gradient(180deg, #8b1d1d 0%, #520f0f 100%)',
    border: '1px solid #ef4444',
    color: '#ffffff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid transparent',
    color: 'var(--text-main)',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { fontSize: '0.78rem', padding: '4px 10px', borderRadius: '3px' },
  md: { fontSize: '0.85rem', padding: '7px 16px', borderRadius: '4px' },
  lg: { fontSize: '0.95rem', padding: '10px 22px', borderRadius: '6px' },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  className = '',
  style,
  children,
  ...rest
}) => {
  const combinedStyle: React.CSSProperties = {
    fontFamily: variant === 'primary' ? "'Cinzel', serif" : "'Inter', sans-serif",
    fontWeight: variant === 'primary' ? 700 : 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.18s ease-in-out',
    userSelect: 'none',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      className={`poe-button-primitive ${className}`}
      style={combinedStyle}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span
          className="spin"
          style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
          }}
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
