'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)]
      hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)]
      text-white shadow-lg
      focus:ring-[var(--primary-500)]
    `,
    secondary: `
      bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)]
      text-[var(--text-primary)]
      focus:ring-[var(--bg-elevated)]
    `,
    ghost: `
      bg-transparent hover:bg-[var(--bg-tertiary)]
      text-[var(--text-secondary)] hover:text-[var(--text-primary)]
      focus:ring-[var(--bg-tertiary)]
    `,
    danger: `
      bg-[var(--error)]
      hover:brightness-110
      text-white shadow-lg
      focus:ring-[var(--error)]
    `,
    success: `
      bg-[var(--success)]
      hover:brightness-110
      text-white shadow-lg
      focus:ring-[var(--success)]
    `,
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',      /* 32px height */
    md: 'h-10 px-4 text-base',   /* 40px height */
    lg: 'h-12 px-6 text-lg',     /* 48px height */
    xl: 'h-14 px-8 text-xl',     /* 56px height */
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
