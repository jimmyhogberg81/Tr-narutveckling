import React from "react";

interface LogoProps {
  className?: string;
  size?: number | string;
}

export const SefNextGenLogo: React.FC<LogoProps> = ({ className, size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Rounded Hexagon Background in SEF Coral Red (#E94B4F) */}
      <path
        d="M 250,15 
           L 460,110 
           A 30,30 0 0 1 475,136 
           L 475,464 
           A 30,30 0 0 1 460,490 
           L 250,585 
           A 20,20 0 0 1 230,585 
           L 40,490 
           A 30,30 0 0 1 25,464 
           L 25,136 
           A 30,30 0 0 1 40,110 
           L 250,15 
           Z"
        fill="#E94B4F"
        stroke="#B2B2B2"
        strokeWidth="14"
        strokeLinejoin="round"
      />

      {/* Center Top Slate Blue Circle with Light Blue Border */}
      <circle cx="250" cy="205" r="125" fill="#0E204D" />
      <circle cx="250" cy="205" r="113" stroke="#9ED6E6" strokeWidth="14" fill="none" />

      {/* Stylized White 'N' (NextGen Brand Emblem) Inside Circle */}
      <g transform="translate(185, 120) scale(1.05)">
        {/* Left pillar of N, rounded elegantly at the top-left */}
        <path
          d="M 12,25 
             C 12,25 12,120 12,120 
             L 34,120 
             L 34,25 
             C 34,25 12,25 12,25 Z"
          fill="#FFFFFF"
        />
        {/* Right pillar of N, rounded elegantly at the bottom-right */}
        <path
          d="M 78,20 
             C 78,20 78,115 78,115 
             L 100,115 
             L 100,20 
             C 100,20 78,20 78,20 Z"
          fill="#FFFFFF"
        />
        {/* Symmetric dynamic bridge connecting the pillars diagonally */}
        <path
          d="M 34,40 
             L 78,100 
             L 78,75 
             L 34,15 
             Z"
          fill="#FFFFFF"
        />
        {/* Curved ribbon accents that match the official logo sweep */}
        <path
          d="M 12,65 
             C 12,35 34,15 56,15 
             C 50,22 42,32 42,45 
             C 42,45 12,65 12,65 Z"
          fill="#9ED6E6"
        />
        <path
          d="M 100,75 
             C 100,105 78,125 56,125 
             C 62,118 70,108 70,95 
             C 70,95 100,75 100,75 Z"
          fill="#9ED6E6"
        />
      </g>

      {/* "SEF NextGen" Text */}
      <text
        x="250"
        y="395"
        fontFamily="sans-serif"
        fontSize="62"
        fontWeight="800"
        fill="#FFFFFF"
        textAnchor="middle"
        letterSpacing="1"
      >
        SEF NextGen
      </text>

      {/* Elegant Separator Line */}
      <line x1="120" y1="435" x2="380" y2="435" stroke="#FFFFFF" strokeWidth="4" />

      {/* "SEDAN 2026" Text */}
      <text
        x="250"
        y="500"
        fontFamily="sans-serif"
        fontSize="36"
        fontWeight="800"
        fill="#FFFFFF"
        textAnchor="middle"
        letterSpacing="8"
      >
        SEDAN 2026
      </text>
    </svg>
  );
};
