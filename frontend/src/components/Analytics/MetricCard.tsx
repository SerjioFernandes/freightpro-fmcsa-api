import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon,
  trend,
  variant = 'primary'
}: MetricCardProps) => {
  const variantStyles = {
    primary: 'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    danger: 'bg-red-50 border-red-200 text-red-700'
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="h-4 w-4" />;
    if (trend.value < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const formatTrend = () => {
    if (!trend) return null;
    const sign = trend.value > 0 ? '+' : '';
    return `${sign}${trend.value}%`;
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide opacity-80">
          {title}
        </h3>
        {icon && <div className="opacity-80">{icon}</div>}
      </div>

      <div className="mb-2">
        <div className="text-3xl font-bold">
          {value}
        </div>
        {subtitle && (
          <div className="text-sm opacity-70 mt-1">
            {subtitle}
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center space-x-1 text-sm font-semibold">
          {getTrendIcon()}
          <span>{formatTrend()}</span>
          {trend.label && (
            <span className="opacity-70">from {trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;

