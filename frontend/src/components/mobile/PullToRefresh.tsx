import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
}

const PullToRefresh = ({ onRefresh, children, threshold = 80 }: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  useEffect(() => {
    const container = document.documentElement;
    let startYPos = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startYPos = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0 && startYPos !== 0) {
        const currentY = e.touches[0].clientY;
        const distance = currentY - startYPos;

        if (distance > 0) {
          e.preventDefault();
          setPullDistance(Math.min(distance, threshold * 1.5));
          setIsPulling(distance > threshold / 2);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }
      setPullDistance(0);
      setIsPulling(false);
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, pullDistance, threshold, isRefreshing]);

  const rotation = (pullDistance / threshold) * 360;

  return (
    <div className="relative">
      <div
        className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300"
        style={{
          opacity: isPulling ? 1 : 0,
          transform: `translate(-50%, ${pullDistance * 0.5}px)`,
          pointerEvents: 'none'
        }}
      >
        <div className="bg-white rounded-full shadow-lg p-2">
          <RefreshCw
            className={`h-8 w-8 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        </div>
      </div>
      {children}
    </div>
  );
};

export default PullToRefresh;

