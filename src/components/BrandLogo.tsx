import React from 'react';

interface BrandLogoProps {
  brandName?: string;
  logoUrl?: string;
  variant?: 'header' | 'compact' | 'certificate' | 'footer';
  className?: string;
}

/**
 * DANIVO INSTITUTE Logo System
 * Combines institutional academic crest geometry with modern digital precision nodes.
 * Note: Per Top Bar Contract, when variant === 'header', renders as a clean single brand lockup without subtitles.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  brandName = 'DANIVO INSTITUTE',
  logoUrl = '',
  variant = 'header',
  className = '',
}) => {
  const renderMark = (sizeClass: string) => {
    if (logoUrl && logoUrl.trim().length > 0) {
      return (
        <img
          src={logoUrl}
          alt={brandName}
          referrerPolicy="no-referrer"
          className={`${sizeClass} object-contain shrink-0`}
        />
      );
    }

    return (
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} shrink-0`}
        aria-hidden="true"
      >
        {/* Academic Shield Base */}
        <path
          d="M20 3L6 8.5V19.5C6 28.4 11.97 36.45 20 39C28.03 36.45 34 28.4 34 19.5V8.5L20 3Z"
          fill="#2563EB"
        />
        {/* Inner Precision Frame */}
        <path
          d="M20 6.2L9 10.5V19.3C9 26.5 13.7 33.1 20 35.4C26.3 33.1 31 26.5 31 19.3V10.5L20 6.2Z"
          stroke="#FFFFFF"
          strokeOpacity="0.28"
          strokeWidth="1.2"
        />
        {/* Open Book / Digital Pillar Motif */}
        <path
          d="M13.5 15.5C15.8 15.5 18.2 16.4 20 17.8C21.8 16.4 24.2 15.5 26.5 15.5V24.5C24.2 24.5 21.8 25.4 20 26.8C18.2 25.4 15.8 24.5 13.5 24.5V15.5Z"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Technology Innovation Node Apex */}
        <circle cx="20" cy="12" r="2" fill="#FFFFFF" />
        <path d="M20 14V26.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  };

  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center ${className}`}>
        {renderMark('w-8 h-8')}
      </span>
    );
  }

  if (variant === 'certificate') {
    return (
      <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
        {renderMark('w-12 h-12')}
        <span className="font-serif-academic text-xl font-bold tracking-tight text-[#0F172A]">
          {brandName}
        </span>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {renderMark('w-8 h-8')}
      <span className="font-display text-base font-bold tracking-tight text-[#0F172A] whitespace-nowrap">
        {brandName}
      </span>
    </span>
  );
};
