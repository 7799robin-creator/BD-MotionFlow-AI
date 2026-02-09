
import React from 'react';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const BrandLogo: React.FC<Props> = ({ className = "", size = 'md' }) => {
  const sizeMap = {
    sm: 'h-8',
    md: 'h-16',
    lg: 'h-24'
  };

  return (
    <div className={`group flex flex-col items-center justify-center transition-all duration-700 ease-in-out transform hover:scale-110 ${className}`}>
      {/* The AI Icon matching the image style */}
      <svg 
        viewBox="0 0 100 100" 
        className={`${sizeMap[size]} transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M45 75H35L48 30H58L45 75Z" 
          fill="#ef4444" 
          className="transition-all duration-500"
        />
        <path 
          d="M25 75L40 50L50 50L35 75H25Z" 
          fill="#ef4444" 
          className="opacity-90"
        />
        <rect 
          x="62" 
          y="30" 
          width="12" 
          height="45" 
          fill="#ef4444" 
          className="transition-all duration-500"
        />
      </svg>
      <div className="mt-1 flex items-center gap-1 overflow-hidden">
        <span className="text-[10px] md:text-xs font-black tracking-[0.3em] text-red-500 uppercase transition-all duration-700 opacity-80 group-hover:opacity-100 group-hover:tracking-[0.4em]">
          AI MOTION
        </span>
      </div>
    </div>
  );
};

export default BrandLogo;
