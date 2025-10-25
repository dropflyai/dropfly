'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  clickable?: boolean;
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  padding = 'md',
  clickable = false,
  hover = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = `
    rounded-lg transition-all duration-200
  `;

  const variants = {
    default: `
      bg-[var(--bg-secondary)]
    `,
    glass: `
      bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]
      shadow-xl
    `,
    elevated: `
      bg-[var(--bg-secondary)]
      shadow-lg
    `,
    bordered: `
      bg-transparent border border-[var(--bg-tertiary)]
    `,
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const interactiveClasses = clickable || hover ? `
    cursor-pointer
    active:scale-[0.98]
    ${hover ? 'hover:shadow-lg hover:bg-[var(--bg-tertiary)]' : ''}
  ` : '';

  return (
    <div
      ref={ref}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${paddings[padding]}
        ${interactiveClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
