export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`animate-spin rounded-full border-indigo-600 border-t-transparent ${sizeClasses[size] || sizeClasses.md}`}
      />
      {text && <p className="text-sm font-medium text-slate-500">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;
