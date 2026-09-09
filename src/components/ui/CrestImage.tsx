import React, { useState } from 'react';
import { getClubByTlaOrName } from '../../constants/clubs';

interface CrestImageProps {
  src?: string;
  alt: string;
  tla?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const CrestImage: React.FC<CrestImageProps> = ({
  src,
  alt,
  tla,
  className = '',
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false);
  const club = tla ? getClubByTlaOrName(tla) : getClubByTlaOrName(alt);

  const fallbackCrest = club?.crest;
  const imageSrc = !hasError && src ? src : fallbackCrest;

  if (hasError || !imageSrc) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-white/10 ${className}`}
        style={{
          backgroundColor: club?.primary || '#38003C',
          color: club?.secondary || '#FFFFFF',
        }}
        title={alt}
      >
        {tla || alt.substring(0, 3).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${sizeClasses[size]} object-contain drop-shadow-sm shrink-0 ${className}`}
    />
  );
};
