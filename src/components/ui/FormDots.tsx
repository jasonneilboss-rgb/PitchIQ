import React from 'react';

interface FormDotsProps {
  form?: string | null;
  count?: number;
  className?: string;
  size?: 'sm' | 'md';
}

export const FormDots: React.FC<FormDotsProps> = ({
  form,
  count = 5,
  className = '',
  size = 'md',
}) => {
  if (!form) return null;

  // Form can be comma-separated or string like 'WWDWL'
  const items = form.includes(',') ? form.split(',') : form.split('');
  const lastItems = items.slice(-count);

  const dotSize = size === 'sm' ? 'w-4 h-4 text-[10px]' : 'w-5 h-5 text-xs';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {lastItems.map((char, index) => {
        const c = char.toUpperCase().trim();
        let bgClass = 'bg-[#B9A9BB] text-black';
        let label = 'D';

        if (c === 'W') {
          bgClass = 'bg-[#00FF85] text-[#2B002E] font-bold';
          label = 'W';
        } else if (c === 'L') {
          bgClass = 'bg-[#E90052] text-white font-bold';
          label = 'L';
        } else if (c === 'D') {
          bgClass = 'bg-[#B9A9BB] text-[#2B002E] font-medium';
          label = 'D';
        }

        return (
          <span
            key={index}
            className={`${dotSize} rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm select-none ${bgClass}`}
            title={`Result: ${label}`}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
};
