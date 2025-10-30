interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'avatar' | 'button' | 'stat';
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'text', className = '' }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const typeClasses = {
    card: 'h-48',
    text: 'h-4',
    avatar: 'w-12 h-12 rounded-full',
    button: 'h-10 w-24',
    stat: 'h-20',
  };

  return <div className={`${baseClasses} ${typeClasses[type]} ${className}`} />;
};

export default SkeletonLoader;
