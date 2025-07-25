import React from 'react';

interface MediconsolLogoProps {
  className?: string;
  size?: number;
}

export function MediconsolLogo({ className = "", size = 32 }: MediconsolLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Medical Cross Background Circle */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="url(#logoGradient)"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Medical Cross */}
      <rect
        x="28"
        y="18"
        width="8"
        height="28"
        rx="2"
        fill="white"
      />
      <rect
        x="18"
        y="28"
        width="28"
        height="8"
        rx="2"
        fill="white"
      />
      
      {/* Data Chart Symbol */}
      <rect x="22" y="48" width="3" height="8" rx="1" fill="rgba(255,255,255,0.8)" />
      <rect x="27" y="44" width="3" height="12" rx="1" fill="rgba(255,255,255,0.8)" />
      <rect x="32" y="40" width="3" height="16" rx="1" fill="rgba(255,255,255,0.8)" />
      <rect x="37" y="46" width="3" height="10" rx="1" fill="rgba(255,255,255,0.8)" />
      
      {/* Pulse Line */}
      <path
        d="M8 20 L16 20 L20 12 L24 28 L28 16 L32 24 L36 8 L40 32 L44 20 L48 20 L56 20"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MediconsolIcon({ className = "", size = 24 }: MediconsolLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Simplified version for smaller sizes */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="url(#iconGradient)"
      />
      
      {/* Medical Cross */}
      <rect x="10" y="7" width="4" height="10" rx="1" fill="white" />
      <rect x="7" y="10" width="10" height="4" rx="1" fill="white" />
      
      {/* Mini chart bars */}
      <rect x="8" y="17" width="1" height="2" fill="rgba(255,255,255,0.8)" />
      <rect x="10" y="16" width="1" height="3" fill="rgba(255,255,255,0.8)" />
      <rect x="12" y="15" width="1" height="4" fill="rgba(255,255,255,0.8)" />
      <rect x="14" y="16" width="1" height="3" fill="rgba(255,255,255,0.8)" />
      
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}