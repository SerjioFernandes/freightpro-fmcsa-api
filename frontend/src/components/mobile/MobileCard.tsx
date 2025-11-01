import type { ReactNode } from 'react';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const MobileCard = ({ children, className = '', onClick }: MobileCardProps) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm 
        border border-gray-200 
        p-4 
        touch-manipulation
        active:bg-gray-50 active:scale-[0.98]
        transition-all duration-150
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
};

export default MobileCard;

