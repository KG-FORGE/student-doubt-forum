import { AlertCircle } from 'lucide-react';

export function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-xs font-semibold text-rose-700 underline hover:text-rose-900"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
