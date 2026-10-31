import { HelpCircle } from 'lucide-react';
import Button from './Button.jsx';

export function EmptyState({
  icon: Icon = HelpCircle,
  title = 'No doubts found',
  description = 'Try adjusting your search filters or be the first to ask a question!',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
