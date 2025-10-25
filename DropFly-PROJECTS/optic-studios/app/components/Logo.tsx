import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true
}) => {
  const sizeClasses = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 }
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const logoSize = sizeClasses[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Image - will use actual logo once provided */}
      <div
        className="relative"
        style={{ width: logoSize.width, height: logoSize.height }}
      >
        <Image
          src="/images/optic-studios-logo.png"
          alt="Optic Studios Logo"
          width={logoSize.width}
          height={logoSize.height}
          className="object-contain"
          priority
          onError={(e) => {
            // Fallback to text if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
      {showText && (
        <span className={`font-bold text-white ${textSizeClasses[size]}`}>
          OPTIC STUDIOS
        </span>
      )}
    </div>
  );
};