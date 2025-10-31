interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'orange' | 'green' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  color = 'blue',
  size = 'md',
  className = '',
  animated = true,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const colorClasses = {
    blue: 'bg-primary-blue',
    orange: 'bg-orange-accent',
    green: 'bg-green-600',
    red: 'bg-red-600',
  };

  const trackColorClasses = {
    blue: 'bg-blue-100',
    orange: 'bg-orange-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-600">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${sizeClasses[size]} ${trackColorClasses[color]} rounded-full overflow-hidden`}
      >
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500 ease-out ${
            animated ? 'animate-fade-in-slide' : ''
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
